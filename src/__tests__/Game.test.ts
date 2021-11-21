import Game from '@tictactoe/Game';
import { Player } from '@tictactoe/Player';

describe('Game', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game();
    });

    it.each`
        size  | cellCount
        ${3}  | ${9}
        ${5}  | ${25}
        ${10} | ${100}
    `('should handle board size of $size', ({ size, cellCount }) => {
        // Custom board size
        game = new Game(size);
        expect(game.boardSize).toBe(size);
        expect(game.board).toHaveLength(cellCount);
    });

    it('should check if board is empty or not', () => {
        expect(game.boardEmpty).toBeTruthy();
        expect(game.emptyCellAmount).toBe(9);

        // With one filled cell
        game.board[0] = Player.First;
        expect(game.boardEmpty).toBeFalsy();
        expect(game.emptyCellAmount).toBe(8);
    });

    it('should check if board is full or not', () => {
        expect(game.boardFull).toBeFalsy();

        // Only few filled cells
        game.board[0] = Player.First;
        game.board[4] = Player.Second;
        expect(game.boardFull).toBeFalsy();

        // Fill the board
        for (let i = 0; i < game.board.length; i++) {
            game.board[i] = Player.First;
        }
        expect(game.boardFull).toBeTruthy();
    });

    it('should pass hand to next player', () => {
        const first = game.currentPlayer;
        // First turn change
        game.nextPlayer();
        expect(game.currentPlayer).not.toBe(first);
        // Another turn change
        game.nextPlayer();
        expect(game.currentPlayer).toBe(first);
    });

    it('should check is a move is valid', () => {
        game.board[2] = Player.First;

        expect(game.isMoveValid(1)).toBeTruthy();
        expect(game.isMoveValid(2)).toBeFalsy();
        expect(game.isMoveValid(8)).toBeTruthy();
        expect(game.isMoveValid(9)).toBeFalsy();
    });

    it.each`
        rows                     | finished | winner
        ${['   ', '   ', '   ']} | ${false} | ${Player.None}
        ${['x o', 'oo ', 'x o']} | ${false} | ${Player.None}
        ${['xxo', 'oox', 'xoo']} | ${true}  | ${Player.None}
        ${['xxx', '   ', '   ']} | ${true}  | ${Player.First}
        ${['x  ', 'x  ', 'x  ']} | ${true}  | ${Player.First}
        ${['x  ', ' x ', '  x']} | ${true}  | ${Player.First}
        ${['   ', 'ooo', '   ']} | ${true}  | ${Player.Second}
        ${['  o', ' o ', 'o  ']} | ${true}  | ${Player.Second}
    `('should check if game is finished with a state of $rows', ({ rows, finished, winner }) => {
        const cellToPlayer = (cell: string) => {
            switch (cell) {
                case 'x':
                    return Player.First;
                case 'o':
                    return Player.Second;
                default:
                    return Player.None;
            }
        };

        // Construct a fake board
        rows.forEach((row: string, rowIndex: number) => {
            [...row].forEach((cell: string, colIndex: number) => {
                game.updateBoard(cellToPlayer(cell), rowIndex * row.length + colIndex);
            });
        });

        expect(game.finished).toBe(finished);
        expect(game.winner).toBe(winner);
    });

    it('should clone game instance', () => {
        const clone = game.clone();
        expect(clone).not.toBe(game);
        expect(clone.boardSize).toBe(game.boardSize);
    });
});
