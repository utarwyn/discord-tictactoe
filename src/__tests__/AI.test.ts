import localize from '@i18n/localize';
import AI from '@tictactoe/ai/AI';
import { AIDifficultyLevel } from '@tictactoe/ai/AIDifficultyLevel';
import Game from '@tictactoe/Game';
import { Player } from '@tictactoe/Player';

jest.mock('@i18n/localize');

describe('AI', () => {
    let ai: AI;

    beforeAll(() => {
        jest.spyOn(localize, '__').mockImplementation(t => t);
    });

    it('should compute display name', () => {
        jest.spyOn(localize, '__').mockReturnValue('Awesome AI');
        expect(new AI().toString()).toBe('Awesome AI');
    });

    describe('Minimax algorithm', () => {
        beforeEach(() => {
            ai = new AI(AIDifficultyLevel.Unbeatable);
        });

        it.each`
            rows                     | score | move
            ${['x  ', ' o ', '   ']} | ${0}  | ${1}
            ${['xx ', ' o ', '   ']} | ${-1} | ${2}
            ${['x  ', 'xo ', '   ']} | ${-1} | ${1}
            ${['xo ', ' x ', '   ']} | ${-1} | ${2}
            ${['xo ', ' o ', '   ']} | ${0}  | ${7}
            ${['xx ', ' o ', ' oo']} | ${-1} | ${2}
            ${['x  ', '  x', ' oo']} | ${-1} | ${6}
        `('should compute minimax algorithm with rows $rows', ({ rows, score, move }) => {
            const game = new Game();
            game['_currentPlayer'] = Player.First;

            // Construct a fake board
            rows.forEach((row: string, rowIndex: number) => {
                [...row].forEach((cell: string, colIndex: number) => {
                    let player = Player.None;
                    if (cell === 'x') {
                        player = Player.First;
                    } else if (cell === 'o') {
                        player = Player.Second;
                    }
                    game.updateBoard(player, rowIndex * row.length + colIndex);
                });
            });

            const operate = ai.operate(game);
            expect(operate.score).toBe(score);
            expect(operate.move).toBe(move);
        });
    });

    describe('Randomize algorithm', () => {
        beforeEach(() => {
            ai = new AI();
            ai['randomRate'] = 1;
        });

        it('should only pick empty cells', () => {
            const game = new Game();
            game.updateBoard(Player.First, 0);
            game.updateBoard(Player.Second, 2);
            for (let i = 0; i < 50; i++) {
                const { move } = ai.operate(game);
                expect(move).toBeDefined();
                expect([0, 2].includes(move!)).toBeFalsy();
            }
        });
    });
});
