import DuelRequest from '@bot/entity/DuelRequest';
import ComponentInteractionMessagingTunnel from '@bot/messaging/ComponentInteractionMessagingTunnel';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import localize from '@i18n/localize';
import { Collection, GuildMember, Message } from 'discord.js';

jest.mock('@bot/messaging/ComponentInteractionMessagingTunnel');
jest.mock('@i18n/localize');

describe('DuelRequest', () => {
    let manager: GameStateManager;
    let invited: GuildMember;
    let tunnel: MessagingTunnel;

    let duelRequest: DuelRequest;

    beforeEach(() => {
        manager = { createGame: jest.fn() as any } as GameStateManager;
        invited = { id: 'invited', toString: jest.fn() as any } as GuildMember;
        tunnel = { author: { displayName: 'Author' }, end: jest.fn() as any } as MessagingTunnel;
        duelRequest = new DuelRequest(manager, tunnel, invited);

        jest.spyOn(localize, '__').mockImplementation(t => t);
    });

    test('should use custom values if provided', () => {
        const customExpireTime = 1;
        const customEmbedColor = 20;
        duelRequest = new DuelRequest(
            manager,
            tunnel,
            invited,
            customExpireTime,
            true,
            customEmbedColor
        );
        expect(duelRequest['expireTime']).toBe(customExpireTime);
        expect(duelRequest['useReactions']).toBeTruthy();
        expect(duelRequest['embedColor']).toBe(customEmbedColor);
    });

    describe('Content', () => {
        test('should add buttons if reactions are disabled', () => {
            Object.assign(duelRequest, { useReactions: false });
            expect(duelRequest.content.components).toHaveLength(1);
            expect((duelRequest.content.components![0] as any).components).toHaveLength(2);
        });

        test('should not add buttons if reactions are enabled', () => {
            Object.assign(duelRequest, { useReactions: true });
            expect(duelRequest.content.components).toHaveLength(0);
        });

        test('should set content to string representation of the invited member', () => {
            const content = 'invited member name';
            jest.spyOn(invited, 'toString').mockReturnValue(content as any);
            expect(duelRequest.content).toHaveProperty('content', content);
        });

        test('should build a description for the embed', () => {
            expect(duelRequest.content.embeds).toHaveLength(1);
            expect((duelRequest.content.embeds![0] as any).data.description).toBe(
                'duel.challenge\nduel.action'
            );
        });

        test('should set embed color', () => {
            expect(duelRequest.content.embeds).toHaveLength(1);
            expect((duelRequest.content.embeds![0] as any).data.color).toBe(
                duelRequest['embedColor']
            );
        });
    });

    describe('Attach to a message', () => {
        let interactionTunnel: ComponentInteractionMessagingTunnel;
        let collector: { on: jest.MockInstance<any, any> };

        let message: Message;

        beforeEach(() => {
            collector = { on: jest.fn().mockReturnThis() };
            interactionTunnel = { end: jest.fn() } as any;
            message = {
                awaitReactions: jest
                    .fn()
                    .mockResolvedValue(new Collection([['1', { emoji: { name: '1' } }]]) as any),
                createMessageComponentCollector: jest.fn().mockReturnValue(collector),
                react: jest.fn()
            } as any;
            jest.mocked(ComponentInteractionMessagingTunnel).mockImplementation(
                () => interactionTunnel
            );
        });

        describe('Using reactions', () => {
            beforeEach(() => Object.assign(duelRequest, { useReactions: true }));

            test('should react on message', async () => {
                Object.assign(DuelRequest, { REACTIONS: ['1', '2', '3', '4'] });
                Object.assign(duelRequest, { useReactions: true });
                await duelRequest.attachTo(message);
                expect(message.react).toHaveBeenCalledTimes(4);
            });

            it.each`
                emoji   | userId       | valid
                ${null} | ${'invited'} | ${false}
                ${'1'}  | ${'other'}   | ${false}
                ${'X'}  | ${'invited'} | ${false}
                ${'1'}  | ${'invited'} | ${true}
            `(
                'should check if emoji $emoji is valid for user $userId',
                async ({ emoji, userId, valid }) => {
                    const spyAwaitReactions = jest.spyOn(message, 'awaitReactions');
                    await duelRequest.attachTo(message);
                    const options = spyAwaitReactions.mock.calls[0][0];
                    expect(
                        options!.filter!({ emoji: { name: emoji } } as any, { id: userId } as any)
                    ).toBe(valid);
                }
            );

            test('should create a game after request been accepted', async () => {
                Object.assign(DuelRequest, { REACTIONS: ['1', '2'] });
                await duelRequest.attachTo(message);
                expect(manager.createGame).toHaveBeenCalledTimes(1);
                expect(manager.createGame).toHaveBeenCalledWith(tunnel, invited);
            });

            test('should end tunnel after request been rejected', async () => {
                Object.assign(DuelRequest, { REACTIONS: ['2', '1'] });
                await duelRequest.attachTo(message);
                expect(tunnel.end).toHaveBeenCalledTimes(1);
                expect(tunnel.end).toHaveBeenCalledWith(
                    expect.objectContaining({ content: 'duel.reject' })
                );
            });

            test('should end tunnel after request expired', async () => {
                jest.spyOn(message, 'awaitReactions').mockRejectedValue(null);
                await duelRequest.attachTo(message);
                expect(tunnel.end).toHaveBeenCalledTimes(1);
                expect(tunnel.end).toHaveBeenCalledWith(
                    expect.objectContaining({ content: 'duel.expire' })
                );
            });
        });

        describe('Using buttons', () => {
            const callCollectorEvent = async (event: string, ...args: any[]): Promise<void> => {
                const collectFn = collector.on.mock.calls.find(call => call[0] === event)[1];
                return collectFn(...args);
            };

            beforeEach(() => Object.assign(duelRequest, { useReactions: false }));

            it.each`
                userId       | valid
                ${'other'}   | ${false}
                ${'invited'} | ${true}
            `(
                'should check if user $userId can answer the duel request',
                async ({ userId, valid }) => {
                    const spyCreateCollector = jest.spyOn(
                        message,
                        'createMessageComponentCollector'
                    );
                    await duelRequest.attachTo(message);
                    const options = spyCreateCollector.mock.calls[0][0];
                    expect(options!.filter!({ user: { id: userId } } as any, {} as any)).toBe(
                        valid
                    );
                }
            );

            test('should create a game after request been accepted', async () => {
                await duelRequest.attachTo(message);
                await callCollectorEvent('collect', { customId: 'yes' });
                expect(manager.createGame).toHaveBeenCalledTimes(1);
                expect(manager.createGame).toHaveBeenCalledWith(interactionTunnel, invited);
            });

            test('should end interaction tunnel after request been rejected', async () => {
                await duelRequest.attachTo(message);
                await callCollectorEvent('collect', { customId: 'no' });
                expect(interactionTunnel.end).toHaveBeenCalledTimes(1);
                expect(interactionTunnel.end).toHaveBeenCalledWith(
                    expect.objectContaining({ content: 'duel.reject' })
                );
            });

            it('should end tunnel with a message if a generic error occured', async () => {
                await duelRequest.attachTo(message);
                await callCollectorEvent('end', null, 'expiration');
                expect(tunnel.end).toHaveBeenCalledTimes(1);
                expect(tunnel.end).toHaveBeenCalledWith(
                    expect.objectContaining({ content: 'duel.expire' })
                );
            });

            it('should do nothing if waiting has expired', async () => {
                await duelRequest.attachTo(message);
                await callCollectorEvent('end', null, 'limit');
                expect(interactionTunnel.end).toHaveBeenCalledTimes(0);
            });
        });
    });
});
