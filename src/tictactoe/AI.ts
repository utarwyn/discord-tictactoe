import GameEntity from '@bot/channel/GameEntity';
import { getOpponent, Player, PlayerComputeType } from '@tictactoe/Player';
import Game from '@tictactoe/Game';
import localize from '@config/localize';

/**
 * Operate the AI behavior (using the minimax alghorithm).
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class AI implements GameEntity {
    /**
     * Identifier of the AI is always "AI"
     */
    id = 'AI';
    /**
     * Display name of an AI
     */
    displayName = localize.__('game.ai');

    /**
     * Operates the AI algorithm on a game instance.
     *
     * @param game game object
     */
    public operate(game: Game): AIComputeResult {
        if (!game.boardEmpty) {
            return AI.minimax(game.clone(), game.emptyCellAmount, game.currentPlayer);
        } else {
            return { move: Math.floor(Math.random() * game.boardSize), score: 0 };
        }
    }

    /**
     * Generates the string representation of the AI in a Discord text channel.
     */
    public toString(): string {
        return this.displayName;
    }

    /**
     * Runs the minimax algorithm for a player at a specific depth in a game.
     *
     * @param game game object
     * @param depth depth at which the algorithm will be operated
     * @param player player object
     */
    private static minimax(game: Game, depth: number, player: Player): AIComputeResult {
        const winner = game.winner;
        const type = AI.getComputeType(player);
        let best: AIComputeResult;

        // Default score
        if (type === PlayerComputeType.Computer) {
            best = { score: -1000 };
        } else {
            best = { score: +1000 };
        }

        // Check for a winner
        if (depth === 0 || winner) {
            return { score: AI.getComputeType(winner) };
        }

        // Go through all cells
        game.board.forEach((cell, index) => {
            if (cell === Player.None) {
                game.board[index] = player;
                const deep = this.minimax(game, depth - 1, getOpponent(player));

                game.board[index] = Player.None;
                deep.move = index;

                if (type === PlayerComputeType.Computer) {
                    if (deep.score > best.score) {
                        best = deep;
                    }
                } else {
                    if (deep.score < best.score) {
                        best = deep;
                    }
                }
            }
        });

        return best;
    }

    /**
     * Converts the player type to a useable type by the algorithm to compute scores.
     *
     * @param player player type object
     */
    private static getComputeType(player: Player): PlayerComputeType {
        if (player === Player.First) {
            return PlayerComputeType.Human;
        } else if (player === Player.Second) {
            // Computer is always at the second place
            return PlayerComputeType.Computer;
        } else {
            return PlayerComputeType.None;
        }
    }
}

/**
 * Represents a result of an AI computation.
 */
export interface AIComputeResult {
    /**
     * Poosition where the AI has decided to play. Can be empty if none found.
     */
    move?: number;
    /**
     * Score computed by the algorithm to find the best move to play.
     */
    score: number;
}
