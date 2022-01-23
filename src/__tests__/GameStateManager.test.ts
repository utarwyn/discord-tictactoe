import DuelRequest from '@bot/entity/DuelRequest';
import GameBoard from '@bot/entity/GameBoard';
import EventHandler from '@bot/EventHandler';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import GameStateValidator from '@bot/state/GameStateValidator';
import TicTacToeBot from '@bot/TicTacToeBot';
import Entity from '@tictactoe/Entity';
import { GuildMember } from 'discord.js';

jest.mock('@bot/entity/DuelRequest');
jest.mock('@bot/entity/GameBoard');
jest.mock('@bot/state/GameStateValidator');
jest.mock('@tictactoe/AI');

describe('GameStateManager', () => {
    const duelRequest = jest.mocked(DuelRequest);
    const gameBoard = jest.mocked(GameBoard);

    let manager: GameStateManager;
    let validator: GameStateValidator;
    let bot: TicTacToeBot;
    let tunnel: MessagingTunnel;

    beforeEach(() => {
        bot = <TicTacToeBot>{
            configuration: {},
            eventHandler: <EventHandler>{
                emitEvent: (_type, _data) => {
                    // empty
                }
            }
        };
        tunnel = <MessagingTunnel>{
            author: { id: 'A1', displayName: 'username' },
            replyWith: _a => Promise.resolve({})
        };

        manager = new GameStateManager(bot);
        validator = manager['validator'];
    });

    describe('Method: requestDuel', () => {
        it('should check if the interaction is valid', async () => {
            const spyValidate = jest.spyOn(validator, 'isInteractionValid');
            const invited = <GuildMember>{};
            await manager.requestDuel(tunnel, invited);
            expect(spyValidate).toHaveBeenCalledTimes(1);
            expect(spyValidate).toHaveBeenCalledWith(tunnel, invited);
        });

        it('should create a duel request and send it into the messaging tunnel', async () => {
            jest.spyOn(validator, 'isInteractionValid').mockReturnValue(true);
            const spyReplyWith = jest.spyOn(tunnel, 'replyWith');
            await manager.requestDuel(tunnel, <GuildMember>{});
            expect(duelRequest).toHaveBeenCalledTimes(1);
            expect(spyReplyWith).toHaveBeenCalledTimes(1);
        });

        it('should setup user cooldown if enabled in configuration', async () => {
            jest.spyOn(validator, 'isInteractionValid').mockReturnValue(true);

            // by default, no cooldown
            await manager.requestDuel(tunnel, <GuildMember>{});
            expect(manager.memberCooldownEndTimes.size).toBe(0);

            // setup fake cooldown
            bot.configuration.requestCooldownTime = 60;
            await manager.requestDuel(tunnel, <GuildMember>{});
            expect(manager.memberCooldownEndTimes.size).toBe(1);
            expect(manager.memberCooldownEndTimes.get('A1')).toBeGreaterThan(Date.now());
        });
    });

    describe('Method: createGame', () => {
        it('should check if the interaction is valid', async () => {
            const spyValidate = jest.spyOn(validator, 'isInteractionValid');
            await manager.createGame(tunnel);
            expect(spyValidate).toHaveBeenCalledTimes(1);
            expect(spyValidate).toHaveBeenCalledWith(tunnel, undefined);
        });

        it('should create a game board and send it into the messaging tunnel', async () => {
            jest.spyOn(validator, 'isInteractionValid').mockReturnValue(true);
            const spyReplyWith = jest.spyOn(tunnel, 'replyWith');

            await manager.createGame(tunnel);

            expect(manager.gameboards).toHaveLength(1);
            expect(gameBoard).toHaveBeenCalledTimes(1);
            expect(spyReplyWith).toHaveBeenCalledTimes(1);
        });
    });

    describe('Method: endGame', () => {
        const entity1 = <Entity>{ id: 'E1' };
        const entity2 = <Entity>{ id: 'E2' };
        const gameboard = <GameBoard>{ entities: [entity1, entity2] };

        it('should remove gameboard from list when ended', () => {
            manager.gameboards.push(gameboard);
            manager.endGame(gameboard);
            expect(manager.gameboards).toHaveLength(0);
        });

        it('should emit win event if ended with a winner', () => {
            const spyEmitEvent = jest.spyOn(bot.eventHandler, 'emitEvent');

            // entity 1 = winner
            manager.endGame(gameboard, entity1);
            expect(spyEmitEvent).toHaveBeenCalledWith('win', { winner: entity1, loser: entity2 });

            // entity 2 = winner
            manager.endGame(gameboard, entity2);
            expect(spyEmitEvent).toHaveBeenCalledWith('win', { winner: entity2, loser: entity1 });
        });

        it('should emit tie event if ended without winner', () => {
            const spyEmitEvent = jest.spyOn(bot.eventHandler, 'emitEvent');
            manager.endGame(gameboard, null);
            expect(spyEmitEvent).toHaveBeenCalledWith('tie', { players: gameboard.entities });
        });
    });
});
