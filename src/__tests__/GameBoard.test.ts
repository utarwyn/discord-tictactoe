import GameBoardBuilder from '@bot/builder/GameBoardBuilder';
import GameBoardButtonBuilder from '@bot/builder/GameBoardButtonBuilder';
import GameBoard from '@bot/entity/GameBoard';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import GameConfig from '@config/GameConfig';
import AI from '@tictactoe/ai/AI';
import Entity from '@tictactoe/Entity';
import Game from '@tictactoe/Game';
import { Player } from '@tictactoe/Player';
import { Collection, Message } from 'discord.js';
import type { Mock } from 'vitest';

vi.mock('@bot/builder/GameBoardBuilder', async importOriginal => {
    const original = await importOriginal<typeof import('@bot/builder/GameBoardBuilder')>();
    return {
        default: vi.fn().mockImplementation(function () {
            return Object.assign(Object.create(original.default.prototype));
        })
    };
});
vi.mock('@bot/builder/GameBoardButtonBuilder', async importOriginal => {
    const original = await importOriginal<typeof import('@bot/builder/GameBoardButtonBuilder')>();
    return {
        default: vi.fn().mockImplementation(function () {
            return Object.assign(Object.create(original.default.prototype));
        })
    };
});
vi.mock('@i18n/localize');
vi.mock('@tictactoe/Game');

const messageFixture = (overrides = {}) => ({ react: vi.fn(), ...overrides }) as unknown as Message;

describe('GameBoard', () => {
    let configuration: GameConfig;
    let manager: GameStateManager;
    let game: Game;
    let opponent: Entity;
    let tunnel: MessagingTunnel;

    let gameBoard: GameBoard;

    beforeEach(() => {
        configuration = {} as GameConfig;
        manager = { endGame: vi.fn() as any } as GameStateManager;
        game = {
            currentPlayer: Player.First,
            finished: false,
            isMoveValid: vi.fn(),
            nextPlayer: vi.fn(),
            updateBoard: vi.fn()
        } as unknown as Game;
        opponent = { id: 'opponent' } as Entity;
        tunnel = {
            author: { id: 'author' },
            editReply: vi.fn(),
            end: vi.fn()
        } as unknown as MessagingTunnel;

        vi.mocked(Game).mockImplementation(function () {
            return game;
        });
        gameBoard = new GameBoard(manager, tunnel, opponent, configuration);
    });

    it('should store entities in an appropriate order', () => {
        expect(gameBoard.entities).toHaveLength(2);
        expect(gameBoard.entities[0].id).toBe('author');
        expect(gameBoard.entities[1].id).toBe('opponent');
    });

    describe('Content', () => {
        const mockedBuilder = {
            toMessageOptions: vi.fn(),
            withBoard: vi.fn().mockReturnThis(),
            withButtonsDisabledAfterUse: vi.fn().mockReturnThis(),
            withEmbed: vi.fn().mockReturnThis(),
            withEmojies: vi.fn().mockReturnThis(),
            withEndingMessage: vi.fn().mockReturnThis(),
            withLoadingMessage: vi.fn().mockReturnThis(),
            withEntityPlaying: vi.fn().mockReturnThis(),
            withExpireMessage: vi.fn().mockReturnThis(),
            withTitle: vi.fn().mockReturnThis()
        };

        const builder = vi.mocked(GameBoardBuilder).mockImplementation(function () {
            return Object.assign(Object.create(GameBoardBuilder.prototype), mockedBuilder);
        });
        const buttonBuilder = vi.mocked(GameBoardButtonBuilder).mockImplementation(function () {
            return Object.assign(Object.create(GameBoardButtonBuilder.prototype), mockedBuilder);
        });

        it.each`
            gameBoardReactions | builder
            ${false}           | ${buttonBuilder}
            ${true}            | ${builder}
        `(
            'should use builder if reactions are $gameBoardReactions',
            ({ gameBoardReactions, builder }) => {
                configuration.gameBoardReactions = gameBoardReactions;
                gameBoard.content;
                expect(builder).toHaveBeenCalledTimes(1);
            }
        );

        it('should set loading message if reactions are not loaded', () => {
            gameBoard.content;
            expect(mockedBuilder.withLoadingMessage).toHaveBeenCalledTimes(1);
        });

        it('should set entity playing if reactions are loaded', () => {
            gameBoard['reactionsLoaded'] = true;
            gameBoard.content;
            expect(mockedBuilder.withEntityPlaying).toHaveBeenCalledTimes(1);
            expect(mockedBuilder.withEntityPlaying).toHaveBeenCalledWith(tunnel.author, undefined);
        });

        it('should set entity playing with an emoji', () => {
            configuration.gameBoardPlayerEmoji = true;
            gameBoard['reactionsLoaded'] = true;
            gameBoard.content;
            expect(mockedBuilder.withEntityPlaying).toHaveBeenCalledTimes(1);
            expect(mockedBuilder.withEntityPlaying).toHaveBeenCalledWith(
                tunnel.author,
                Player.First
            );
        });

        it('should add an ending message if the game is finished', () => {
            Object.assign(game, { finished: true, winner: Player.Second } as Game);
            gameBoard.content;
            expect(mockedBuilder.withEndingMessage).toHaveBeenCalledTimes(1);
            expect(mockedBuilder.withEndingMessage).toHaveBeenCalledWith(opponent);
        });

        it('should use custom emojies from the configuration if provided', () => {
            configuration.gameBoardEmojies = ['1', '2', '3'];
            gameBoard.content;
            expect(mockedBuilder.withEmojies).toHaveBeenCalledTimes(1);
            expect(mockedBuilder.withEmojies).toHaveBeenCalledWith('1', '2', '3');
        });

        it('should not use custom emojies if configuration is invalid', () => {
            configuration.gameBoardEmojies = ['1'];
            gameBoard.content;
            expect(mockedBuilder.withEmojies).toHaveBeenCalledTimes(0);
        });

        it('should set embed in builder if embed is enabled', () => {
            configuration.gameBoardEmbed = true;
            gameBoard.content;
            expect(mockedBuilder.withEmbed).toHaveBeenCalledTimes(1);
        });

        it('should use custom embed color in builder if provided', () => {
            configuration.embedColor = '#0000ff';
            configuration.gameBoardEmbed = true;
            gameBoard.content;
            expect(mockedBuilder.withEmbed).toHaveBeenCalledTimes(1);
            expect(mockedBuilder.withEmbed).toHaveBeenCalledWith(configuration.embedColor);
        });

        it.each`
            gameBoardDisableButtons | gameBoardReactions | calledTimes | description
            ${false}                | ${true}            | ${0}        | ${'enabled'}
            ${true}                 | ${true}            | ${0}        | ${'enabled'}
            ${false}                | ${false}           | ${0}        | ${'enabled'}
            ${true}                 | ${false}           | ${1}        | ${'disabled'}
        `(
            'should $description button after use with reactions $gameBoardReactions and disable buttons $gameBoardDisableButtons',
            ({ gameBoardDisableButtons, gameBoardReactions, calledTimes }) => {
                configuration.gameBoardDisableButtons = gameBoardDisableButtons;
                configuration.gameBoardReactions = gameBoardReactions;
                gameBoard.content;
                expect(mockedBuilder.withButtonsDisabledAfterUse).toHaveBeenCalledTimes(
                    calledTimes
                );
            }
        );

        it('should return message options from the builder', () => {
            const messageOptions = { content: 'awesome content' };
            vi.spyOn(mockedBuilder, 'toMessageOptions').mockReturnValue(messageOptions);
            expect(gameBoard.content).toEqual(messageOptions);
        });
    });

    describe('Attach to a message', () => {
        let message: Message;

        beforeEach(() => (message = messageFixture({ react: vi.fn() })));

        it('should react on message if reactions are enabled', async () => {
            Object.assign(GameBoardBuilder, { MOVE_REACTIONS: ['1', '2', '3', '4'] });
            configuration.gameBoardReactions = true;
            await gameBoard.attachTo(message);
            expect(message.react).toHaveBeenCalledTimes(4);
        });

        it('should destroy if an error occured during reaction', async () => {
            configuration.gameBoardReactions = true;
            vi.spyOn(message, 'react').mockRejectedValue(null);
            await gameBoard.attachTo(message);
            expect(manager.endGame).toHaveBeenCalledTimes(1);
        });

        it('should setup reply with the gameboard', async () => {
            await gameBoard.attachTo(message);
            expect(gameBoard['reactionsLoaded']).toBeTruthy();
            expect(tunnel.editReply).toHaveBeenCalledTimes(1);
        });
    });

    describe('Handle a game turn', () => {
        beforeEach(() => {
            Object.assign(game, { finished: true } as Game);
        });

        describe('AI', () => {
            let ai: AI;

            beforeEach(() => {
                ai = Object.assign(Object.create(AI.prototype), { operate: vi.fn() });
                gameBoard.entities[0] = ai;
            });

            it('should operate AI and play turn if move is valid', async () => {
                vi.spyOn(ai, 'operate').mockReturnValue({ move: 5, score: 1 });
                await gameBoard.attemptNextTurn();
                expect(ai.operate).toHaveBeenCalledTimes(1);
                expect(ai.operate).toHaveBeenCalledWith(game);
                expect(game.updateBoard).toHaveBeenCalledTimes(1);
                expect(game.updateBoard).toHaveBeenCalledWith(Player.First, 5);
            });

            it('should operate AI but do nothing if move is invalid', async () => {
                vi.spyOn(ai, 'operate').mockReturnValue({ score: 0 });
                await gameBoard.attemptNextTurn();
                expect(game.updateBoard).toHaveBeenCalledTimes(0);
            });

            it('should loop turns', async () => {
                vi.spyOn(ai, 'operate')
                    .mockReturnValueOnce({ move: 0, score: 10 })
                    .mockReturnValue({ score: 0 });

                Object.assign(game, { finished: false } as Game);
                await gameBoard.attemptNextTurn();
                expect(ai.operate).toHaveBeenCalledTimes(2);
                expect(game.nextPlayer).toHaveBeenCalledTimes(1);
            });

            it('should end tunnel if game board has to be deleted', async () => {
                Object.assign(game, { finished: true, winner: Player.First } as Game);
                configuration.gameBoardDelete = true;
                vi.spyOn(ai, 'operate').mockReturnValue({ move: 5, score: 1 });
                await gameBoard.attemptNextTurn();
                expect(tunnel.end).toHaveBeenCalledTimes(1);
            });

            it.each`
                gameBoardReactions | calledTimes | description
                ${false}           | ${0}        | ${'not delete'}
                ${true}            | ${1}        | ${'delete'}
            `(
                'should $description reactions at the end of the game if reactions are $gameBoardReactions',
                async ({ gameBoardReactions, calledTimes }) => {
                    configuration.gameBoardReactions = gameBoardReactions;
                    const reply = messageFixture({ reactions: { removeAll: vi.fn() } });
                    Object.assign(tunnel, { reply });
                    vi.spyOn(ai, 'operate').mockReturnValue({ move: 5, score: 1 });
                    await gameBoard.attemptNextTurn();
                    expect(reply.reactions.removeAll).toHaveBeenCalledTimes(calledTimes);
                }
            );
        });

        describe('Human: wait for a reaction', () => {
            let reply: Message;

            beforeEach(() => {
                reply = messageFixture({ awaitReactions: vi.fn().mockResolvedValue(null) });
                Object.assign(tunnel, { reply });
                configuration.gameBoardReactions = true;
            });

            it('should apply move after reaction being selected', async () => {
                Object.assign(GameBoardBuilder, { MOVE_REACTIONS: ['1', '2'] });
                vi.spyOn(reply, 'awaitReactions').mockResolvedValue(
                    new Collection([['1', { emoji: { name: '2' } }]]) as any
                );
                await gameBoard.attemptNextTurn();
                expect(game.updateBoard).toHaveBeenCalledTimes(1);
                expect(game.updateBoard).toHaveBeenCalledWith(Player.First, 1);
            });

            it('should end game if an error occured during reaction await', async () => {
                vi.spyOn(reply, 'awaitReactions').mockRejectedValue(null);
                await gameBoard.attemptNextTurn();
                expect(game.updateBoard).toHaveBeenCalledTimes(0);
            });

            it.each`
                emoji   | userId      | moveValid | valid
                ${null} | ${'author'} | ${false}  | ${false}
                ${'1'}  | ${'other'}  | ${false}  | ${false}
                ${'1'}  | ${'author'} | ${false}  | ${false}
                ${'1'}  | ${'author'} | ${true}   | ${true}
            `(
                'should check if emoji $emoji is valid for user $userId with moveValid=$moveValid',
                async ({ emoji, userId, moveValid, valid }) => {
                    vi.spyOn(game, 'isMoveValid').mockReturnValue(moveValid);
                    const spyAwaitReactions = vi.spyOn(reply, 'awaitReactions');
                    await gameBoard.attemptNextTurn();
                    const options = spyAwaitReactions.mock.calls[0][0];
                    expect(
                        options!.filter!({ emoji: { name: emoji } } as any, { id: userId } as any)
                    ).toBe(valid);
                }
            );

            it('should await with a custom time', async () => {
                configuration.gameExpireTime = 60;
                await gameBoard.attemptNextTurn();
                expect(tunnel.reply?.awaitReactions).toHaveBeenCalledTimes(1);
                expect(tunnel.reply?.awaitReactions).toHaveBeenCalledWith(
                    expect.objectContaining({ time: 60000 })
                );
            });
        });

        describe('Human: wait for a button press', () => {
            let reply: Message;
            let collector: { on: Mock };

            const callCollectorEvent = async (event: string, ...args: any[]): Promise<void> => {
                await gameBoard.attemptNextTurn();
                const collectFn = collector.on.mock.calls.find(call => call[0] === event)![1];
                return collectFn(...args);
            };

            beforeEach(() => {
                collector = { on: vi.fn().mockReturnThis() };
                reply = messageFixture({
                    createMessageComponentCollector: vi.fn().mockReturnValue(collector)
                });
                Object.assign(tunnel, { reply });
                configuration.gameBoardReactions = false;
            });

            it('should apply move after button being pressed', async () => {
                const spyUpdate = vi.fn();
                Object.assign(GameBoardBuilder, { MOVE_REACTIONS: ['1', '2'] });

                await callCollectorEvent('collect', { customId: '1', update: spyUpdate });

                expect(game.updateBoard).toHaveBeenCalledTimes(1);
                expect(game.updateBoard).toHaveBeenCalledWith(Player.First, 1);
                expect(spyUpdate).toHaveBeenCalledTimes(1);
            });

            it('should expire game and keep gameboard if an error occured', async () => {
                configuration.gameBoardDelete = false;
                await callCollectorEvent('end', null, 'expiration');
                expect(game.updateBoard).toHaveBeenCalledTimes(0);
                expect(tunnel.end).toHaveBeenCalledTimes(0);
                expect(manager.endGame).toHaveBeenCalledTimes(1);
            });

            it('should expire game and delete gameboard if an error occured', async () => {
                configuration.gameBoardDelete = true;
                await callCollectorEvent('end', null, 'expiration');
                expect(game.updateBoard).toHaveBeenCalledTimes(0);
                expect(tunnel.end).toHaveBeenCalledTimes(1);
                expect(manager.endGame).toHaveBeenCalledTimes(1);
            });

            it('should not update board game if waiting has expired', async () => {
                await callCollectorEvent('end', null, 'limit');
                expect(game.updateBoard).toHaveBeenCalledTimes(0);
                expect(manager.endGame).toHaveBeenCalledTimes(0);
            });

            it.each`
                customId | userId      | moveValid | valid
                ${'1'}   | ${'other'}  | ${false}  | ${false}
                ${'1'}   | ${'author'} | ${false}  | ${false}
                ${'1'}   | ${'author'} | ${true}   | ${true}
            `(
                'should check if button $customId is valid for user $userId with moveValid=$moveValid',
                async ({ customId, userId, valid }) => {
                    vi.spyOn(game, 'isMoveValid').mockReturnValue(valid);
                    const spyCreateCollector = vi.spyOn(reply, 'createMessageComponentCollector');
                    await gameBoard.attemptNextTurn();
                    const options = spyCreateCollector.mock.calls[0][0];
                    expect(
                        options!.filter!({ customId, user: { id: userId } } as any, {} as any)
                    ).toBe(valid);
                }
            );

            it('should await with a custom time', async () => {
                configuration.gameExpireTime = 60;
                await gameBoard.attemptNextTurn();
                expect(tunnel.reply?.createMessageComponentCollector).toHaveBeenCalledTimes(1);
                expect(tunnel.reply?.createMessageComponentCollector).toHaveBeenCalledWith(
                    expect.objectContaining({ time: 60000 })
                );
            });
        });
    });
});
