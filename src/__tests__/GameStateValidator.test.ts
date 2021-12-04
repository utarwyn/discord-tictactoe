import GameBoard from '@bot/entity/GameBoard';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import GameStateValidator from '@bot/state/GameStateValidator';
import TicTacToeBot from '@bot/TicTacToeBot';
import Config from '@config/Config';
import Entity from '@tictactoe/Entity';
import {
    Collection,
    Guild,
    GuildMember,
    GuildMemberRoleManager,
    Permissions,
    PermissionString,
    Role,
    TextChannel
} from 'discord.js';

describe('GameStateValidator', () => {
    let tunnel: MessagingTunnel;
    let manager: GameStateManager;
    let validator: GameStateValidator;

    beforeEach(() => {
        // default state is valid
        tunnel = <MessagingTunnel>{
            channel: <TextChannel>{
                id: 'TC1',
                guild: <Guild>{
                    me: <GuildMember>{
                        permissionsIn: _c => <Readonly<Permissions>>{ has: _p => true }
                    }
                }
            },
            author: <GuildMember>{
                id: 'GM1',
                roles: <GuildMemberRoleManager>{
                    cache: new Collection()
                },
                permissions: <Readonly<Permissions>>{ has: _ => true }
            }
        };
        manager = <GameStateManager>{
            gameboards: [
                { tunnel: <MessagingTunnel>{}, entities: [] as Array<Entity> }
            ] as Array<GameBoard>,
            memberCooldownEndTimes: new Map(),
            bot: <TicTacToeBot>{
                configuration: <Config>{}
            }
        };
        validator = new GameStateValidator(manager);
    });

    it.each`
        permissions                        | expected
        ${[]}                              | ${false}
        ${['ADD_REACTIONS']}               | ${false}
        ${GameStateValidator['PERM_LIST']} | ${true}
    `('should check for member permissions $permissions', ({ permissions, expected }) => {
        const spyError = jest.spyOn(global.console, 'error').mockImplementation();
        jest.spyOn(tunnel.channel.guild.me!, 'permissionsIn').mockReturnValue(<
            Readonly<Permissions>
        >{
            has: list => (list as Array<PermissionString>).every(k => permissions.includes(k))
        });

        expect(validator.isInteractionValid(tunnel)).toBe(expected);
        expect(spyError).toHaveBeenCalledTimes(expected ? 0 : 1);
        spyError.mockRestore();
    });

    it.each`
        allowedRoleIds  | memberRoles     | isAdmin  | expected
        ${['R1']}       | ${[]}           | ${false} | ${false}
        ${['R1']}       | ${['R2']}       | ${false} | ${false}
        ${['R1', 'R2']} | ${['R1']}       | ${false} | ${true}
        ${['R1']}       | ${['R1']}       | ${false} | ${true}
        ${['R1']}       | ${['R1', 'R2']} | ${false} | ${true}
        ${['R1']}       | ${[]}           | ${true}  | ${true}
        ${[]}           | ${[]}           | ${false} | ${true}
        ${[]}           | ${[]}           | ${true}  | ${true}
    `(
        'should check with member roles $memberRoles and admin $isAdmin (allowed roles: $allowedRoleIds)',
        ({ allowedRoleIds, memberRoles, isAdmin, expected }) => {
            jest.spyOn(tunnel.author.permissions, 'has').mockReturnValue(isAdmin);
            jest.spyOn(tunnel.author.permissions, 'has').mockReturnValue(isAdmin);
            Object.defineProperty(tunnel.author.roles, 'cache', {
                value: new Collection(
                    memberRoles.map((roleId: string) => [roleId, <Role>{ id: roleId }])
                )
            });
            manager.bot.configuration.allowedRoleIds = allowedRoleIds;
            expect(validator.isInteractionValid(tunnel)).toBe(expected);
        }
    );

    it.each`
        cooldownTime | currentTime         | expected
        ${10}        | ${Number.MAX_VALUE} | ${false}
        ${20}        | ${Date.now() * 2}   | ${false}
        ${undefined} | ${0}                | ${true}
        ${0}         | ${undefined}        | ${true}
        ${10}        | ${undefined}        | ${true}
        ${5}         | ${Date.now() - 20}  | ${true}
    `(
        'should check with cooldown time $cooldownTime and current time $currentTime',
        ({ cooldownTime, currentTime, expected }) => {
            if (currentTime !== undefined) {
                manager.memberCooldownEndTimes.set('GM1', currentTime);
            }
            manager.bot.configuration.requestCooldownTime = cooldownTime;
            expect(validator.isInteractionValid(tunnel)).toBe(expected);
        }
    );

    it.each`
        sameChannel | sameAuthor | sameInvited | simultaneousGames | expected
        ${false}    | ${true}    | ${false}    | ${false}          | ${false}
        ${true}     | ${true}    | ${false}    | ${true}           | ${false}
        ${true}     | ${false}   | ${false}    | ${false}          | ${false}
        ${false}    | ${false}   | ${true}     | ${false}          | ${false}
        ${false}    | ${false}   | ${false}    | ${false}          | ${true}
        ${true}     | ${false}   | ${false}    | ${true}           | ${true}
    `(
        'should check gameboard states with sameChannel $sameChannel, sameAuthor $sameAuthor, simultaneous option $simultaneousGames and invited $sameInvited',
        ({ sameChannel, sameAuthor, sameInvited, simultaneousGames, expected }) => {
            if (sameChannel) {
                manager.gameboards[0] = <GameBoard>{ ...manager.gameboards[0], tunnel };
            }
            if (sameAuthor || sameInvited) {
                manager.gameboards[0] = <GameBoard>{
                    ...manager.gameboards[0],
                    entities: [tunnel.author as Entity]
                };
            }
            manager.bot.configuration.simultaneousGames = simultaneousGames;
            const invited = sameInvited ? tunnel.author : undefined;
            expect(validator.isInteractionValid(tunnel, invited)).toBe(expected);
        }
    );
});
