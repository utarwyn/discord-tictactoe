import { getOpponent, Player } from '@tictactoe/Player';

/**
 * Back implementation of a game.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
export default class Game {
    /**
     * Size of the board.
     * @private
     */
    private readonly _boardSize: number;
    /**
     * Board data array.
     * @private
     */
    private readonly _board: Array<Player>;
    /**
     * Current player that has to player this round.
     * @private
     */
    private _currentPlayer: Player;
    /**
     * Stores winner of the game. Player.None if not finished or tie.
     * @private
     */
    private _winner: Player;

    /**
     * Constructs a new game implementation.
     *
     * @param boardSize size of the board, default is 3
     */
    constructor(boardSize = 3) {
        this._boardSize = boardSize;
        this._board = [];
        this._winner = Player.None;

        // Randomize the first player
        this._currentPlayer = Math.random() < 0.5 ? Player.First : Player.Second;

        // Fill the board with empty data
        for (let i = 0; i < boardSize * boardSize; i++) {
            this._board[i] = Player.None;
        }
    }

    /**
     * Retrieves the board size.
     */
    public get boardSize(): number {
        return this._boardSize;
    }

    /**
     * Retrieves the board data array.
     */
    public get board(): Array<Player> {
        return this._board;
    }

    /**
     * Checks if the game is finished or not.
     */
    public get finished(): boolean {
        return this.winner !== Player.None || this.boardFull;
    }

    /**
     * Retrieves the player that has to play.
     */
    public get currentPlayer(): Player {
        return this._currentPlayer;
    }

    /**
     * Retrieves the winner of the game.
     */
    public get winner(): Player {
        return this._winner;
    }

    /**
     * Checks if the board is full.
     */
    public get boardFull(): boolean {
        return this.board.every(cell => cell !== Player.None);
    }

    /**
     * Checks if the board is empty.
     */
    public get boardEmpty(): boolean {
        return this.board.every(cell => cell === Player.None);
    }

    /**
     * Retrieves the amount of empty cells on the board.
     */
    public get emptyCellAmount(): number {
        return this.board.filter(cell => cell === Player.None).length;
    }

    /**
     * Clones the current Game instance and board.
     */
    public clone(): Game {
        const game = new Game(this.boardSize);
        for (let i = 0; i < this.board.length; i++) {
            game.board[i] = this.board[i];
        }
        return game;
    }

    /**
     * Checks if a player move is valid or not.
     *
     * @param position move where the player wants to play
     */
    public isMoveValid(position: number): boolean {
        return position < this.board.length && this.board[position] === Player.None;
    }

    /**
     * Updates the board with a player move and computes winner.
     * Does not check if the move is valid, it replaces the board position.
     *
     * @param player player that has played on the move
     * @param position move where the player has played
     */
    public updateBoard(player: Player, position: number): void {
        this.board[position] = player;
        this._winner = this.computeWinner();
    }

    /**
     * Calculates the next player that have to play.
     */
    public nextPlayer(): void {
        this._currentPlayer = getOpponent(this.currentPlayer);
    }

    /**
     * Computes the winner of the game.
     * @private
     */
    private computeWinner(): Player {
        // Check horizontally
        for (let row = 0; row < this.boardSize; row++) {
            const i1 = this.toIndex(row, 0);
            const i2 = this.toIndex(row, 1);
            const i3 = this.toIndex(row, 2);

            if (this.validEquals(i1, i2) && this.validEquals(i2, i3)) {
                return this.board[i1];
            }
        }

        // Check vertically
        for (let col = 0; col < this.boardSize; col++) {
            const i1 = this.toIndex(0, col);
            const i2 = this.toIndex(1, col);
            const i3 = this.toIndex(2, col);

            if (this.validEquals(i1, i2) && this.validEquals(i2, i3)) {
                return this.board[i1];
            }
        }

        // Check diagonals
        const middle = this.toIndex(1, 1);
        const topLeft = this.toIndex(0, 0);
        const topRight = this.toIndex(0, 2);
        const bottomRight = this.toIndex(2, 2);
        const bottomLeft = this.toIndex(2, 0);

        if (this.validEquals(topLeft, middle) && this.validEquals(middle, bottomRight)) {
            return this.board[middle];
        }
        if (this.validEquals(topRight, middle) && this.validEquals(middle, bottomLeft)) {
            return this.board[middle];
        }

        return Player.None;
    }

    /**
     * Calculates the move of a
     * cell on the board from its row and column.
     *
     * @param row row move
     * @param column column move
     */
    private toIndex(row: number, column: number): number {
        return row * this.boardSize + column;
    }

    /**
     * Checks if cells at two positions are not empty and equals.
     *
     * @param position1 first move
     * @param position2 second move
     */
    private validEquals(position1: number, position2: number): boolean {
        return (
            this.board[position1] !== Player.None && this.board[position1] === this.board[position2]
        );
    }
}
