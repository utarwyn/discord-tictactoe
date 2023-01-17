import DuelRequest from '@bot/entity/DuelRequest';
import GameBoard from '@bot/entity/GameBoard';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import GameStateValidator from '@bot/state/GameStateValidator';
import TicTacToeBot from '@bot/TicTacToeBot';
import AI from '@tictactoe/ai/AI';
import { AIDifficultyLevel } from '@tictactoe/ai/AIDifficultyLevel';
import Entity from '@tictactoe/Entity';
import { GuildMember } from 'discord.js';

jest.mock('@bot/entity/DuelRequest');
jest.mock('@bot/entity/GameBoard');
jest.mock('@bot/state/GameStateValidator');
jest.mock('@tictactoe/ai/AI');

describe('GameStateManager', () => {
    const duelRequest = jest.mocked(DuelRequest);
    const gameBoard = jest.mocked(GameBoard);

    let manager: GameStateManager;
    let validator: GameStateValidator;
    let bot: TicTacToeBot;
    let tunnel: MessagingTunnel;

    beforeEach(() => {
        bot = {
            configuration: {},
            eventHandler: { emitEvent: (_type, _data) => undefined }
        } as TicTacToeBot;
        tunnel = {
            author: { id: 'A1', displayName: 'username' },
            replyWith: _a => Promise.resolve({})
        } as MessagingTunnel;
        validator = {
            isInteractionValid: jest.fn().mockReturnValue(true) as any,
            isNewGamePossible: jest.fn().mockReturnValue(true) as any
        } as GameStateValidator;

        jest.mocked(GameStateValidator).mockImplementation(() => validator);
        manager = new GameStateManager(bot);
    });

    describe('Method: requestDuel', () => {
        it('should reject if interaction is invalid', async () => {
            jest.spyOn(validator, 'isInteractionValid').mockReturnValue(false);
            await expect(manager.requestDuel(tunnel, {} as GuildMember)).resolves.toBeUndefined();
            expect(validator.isInteractionValid).toHaveBeenCalledTimes(1);
            expect(validator.isInteractionValid).toHaveBeenCalledWith(tunnel);
        });

        it('should reject if a new game is not possible', async () => {
            jest.spyOn(validator, 'isNewGamePossible').mockReturnValue(false);
            const invited = {} as GuildMember;
            await expect(manager.requestDuel(tunnel, invited)).rejects.toBeUndefined();
            expect(validator.isNewGamePossible).toHaveBeenCalledTimes(1);
            expect(validator.isNewGamePossible).toHaveBeenCalledWith(tunnel, invited);
        });

        it('should create a duel request and send it into the messaging tunnel', async () => {
            const spyReplyWith = jest.spyOn(tunnel, 'replyWith');
            await manager.requestDuel(tunnel, <GuildMember>{});
            expect(duelRequest).toHaveBeenCalledTimes(1);
            expect(spyReplyWith).toHaveBeenCalledTimes(1);
        });

        it('should setup user cooldown if enabled in configuration', async () => {
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
        it('should reject if interaction is invalid', async () => {
            jest.spyOn(validator, 'isInteractionValid').mockReturnValue(false);
            await expect(manager.createGame(tunnel)).resolves.toBeUndefined();
            expect(validator.isInteractionValid).toHaveBeenCalledTimes(1);
            expect(validator.isInteractionValid).toHaveBeenCalledWith(tunnel);
        });

        it('should reject if a new game is not possible', async () => {
            jest.spyOn(validator, 'isNewGamePossible').mockReturnValue(false);
            const invited = <GuildMember>{};
            await expect(manager.createGame(tunnel, invited)).rejects.toBeUndefined();
            expect(validator.isNewGamePossible).toHaveBeenCalledTimes(1);
            expect(validator.isNewGamePossible).toHaveBeenCalledWith(tunnel, invited);
        });

        it('should create a game board and send it into the messaging tunnel', async () => {
            const spyReplyWith = jest.spyOn(tunnel, 'replyWith');

            const invited = <GuildMember>{};
            await manager.createGame(tunnel, invited);

            expect(manager.gameboards).toHaveLength(1);
            expect(gameBoard).toHaveBeenCalledTimes(1);
            expect(gameBoard).toHaveBeenCalledWith(manager, tunnel, invited, expect.anything());
            expect(spyReplyWith).toHaveBeenCalledTimes(1);
        });

        describe('Using AI if there is no invited member', () => {
            it('should create using default difficulty', async () => {
                const spyCreateAI = jest.mocked(AI);
                await manager.createGame(tunnel);

                expect(spyCreateAI).toHaveBeenCalledWith(undefined);
                expect(gameBoard).toHaveBeenCalledTimes(1);
                expect(gameBoard).toHaveBeenCalledWith(
                    manager,
                    tunnel,
                    expect.any(AI),
                    expect.anything()
                );
            });

            it('should create using custom difficulty', async () => {
                const spyCreateAI = jest.mocked(AI);
                bot.configuration.aiDifficulty = 'Unbeatable';
                await manager.createGame(tunnel);
                expect(spyCreateAI).toHaveBeenCalledWith(AIDifficultyLevel.Unbeatable);
            });
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
