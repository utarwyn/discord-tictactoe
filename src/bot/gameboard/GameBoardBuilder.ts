import GameEntity from '@bot/channel/GameEntity';
import localize from '@config/localize';
import AI from '@tictactoe/AI';
import { Player } from '@tictactoe/Player';

/**
 * Builds string representation of a game board
 * whiches will be displayed as a Discord message.
 *
 * @author Utarwyn
 * @since 2.1.0
 */
export default class GameBoardBuilder {
    /**
     * Unicode reactions available for moves.
     */
    public static readonly MOVE_REACTIONS = ['↖️', '⬆️', '↗️', '⬅️', '⏺️', '➡️', '↙️', '⬇️', '↘️'];
    /**
     * Unicode emojis used for representing the two players.
     */
    public static readonly PLAYER_EMOJIS = ['⬜', '🇽', '🅾️'];
    /**
     * Stores game board title message.
     * @private
     */
    private title: string;
    /**
     * Stores game board data.
     * @private
     */
    private board: string;
    /**
     * Stores game current state.
     * @private
     */
    private state: string;

    /**
     * Constructs a new game board builder.
     */
    constructor() {
        this.title = '';
        this.board = '';
        this.state = '';
    }

    /**
     * Writes a title to the game board message.
     *
     * @param player1 first entity to play
     * @param player2 second entity to play
     */
    withTitle(player1: GameEntity, player2: GameEntity): GameBoardBuilder {
        this.title =
            localize.__('game.title', {
                player1: player1.displayName,
                player2: player2.displayName
            }) + '\n\n';
        return this;
    }

    /**
     * Writes representation of a game board.
     *
     * @param boardSize size of the board
     * @param board game board data
     */
    withBoard(boardSize: number, board: Player[]): GameBoardBuilder {
        this.board = '';
        for (let i = 0; i < boardSize * boardSize; i++) {
            this.board += GameBoardBuilder.PLAYER_EMOJIS[board[i]] + ' ';
            if ((i + 1) % boardSize === 0) {
                this.board += '\n';
            }
        }
        return this;
    }

    /**
     * Writes that an entity is playing.
     *
     * @param entity entity whiches is playing. If undefined: display loading message
     */
    withEntityPlaying(entity?: GameEntity): GameBoardBuilder {
        if (entity instanceof AI) {
            this.state = localize.__('game.waiting-ai');
        } else if (!entity) {
            this.state = localize.__('game.load');
        } else {
            this.state = localize.__('game.action', { player: entity.toString() });
        }
        return this;
    }

    /**
     * Writes ending state of a game.
     *
     * @param winner winning entity. If undefined: display tie message
     */
    withEndingMessage(winner?: GameEntity): GameBoardBuilder {
        if (winner) {
            this.state = localize.__('game.win', { player: winner.toString() });
        } else {
            this.state = localize.__('game.end');
        }
        return this;
    }

    /**
     * Constructs final string representation of the game board.
     */
    toString(): string {
        const state = this.state && this.board ? '\n' + this.state : this.state;
        return this.title + this.board + state;
    }
}
