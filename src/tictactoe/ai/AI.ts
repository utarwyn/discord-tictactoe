import localize from '@i18n/localize';
import { AIComputeResult } from '@tictactoe/ai/AIComputeResult';
import { AIDifficultyLevel } from '@tictactoe/ai/AIDifficultyLevel';
import Entity from '@tictactoe/Entity';
import Game from '@tictactoe/Game';
import { getOpponent, Player, PlayerComputeType } from '@tictactoe/Player';

/**
 * Operate the AI behavior (using the minimax alghorithm).
 *
 * @author Utarwyn
 * @since 2.0.0
 * @internal
 */
export default class AI implements Entity {
    /**
     * Randomness rate of each difficulty level.
     */
    private static readonly DIFFICULTY_RANDOM_RATES: Record<AIDifficultyLevel, number> = {
        [AIDifficultyLevel.Easy]: 0.5,
        [AIDifficultyLevel.Medium]: 0.25,
        [AIDifficultyLevel.Hard]: 0.1,
        [AIDifficultyLevel.Unbeatable]: 0
    };

    /**
     * Identifier of the AI is always "AI".
     */
    public id = 'AI';
    /**
     * Display name of an AI.
     */
    public displayName = localize.__('game.ai');
    /**
     * Probability of running the randomized algorithm.
     */
    private randomRate: number;

    /**
     * Creates an AI.
     *
     * @param difficultyLevel difficulty level of the AI
     */
    constructor(difficultyLevel = AIDifficultyLevel.Unbeatable) {
        this.randomRate = AI.DIFFICULTY_RANDOM_RATES[difficultyLevel];
    }

    /**
     * Operates the AI algorithm on a game instance.
     *
     * @param game game object
     */
    public operate(game: Game): AIComputeResult {
        if (!game.boardEmpty && (this.randomRate === 0 || Math.random() >= this.randomRate)) {
            return AI.minimax(game.clone(), game.emptyCellAmount, game.currentPlayer);
        } else {
            return AI.randomized(game);
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
     * @returns ai computation result
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
                best = this.minimaxCell(game, depth, player, best, index);
            }
        });

        return best;
    }

    /**
     * Process a cell at a specific depth using the minimax algorithm.
     *
     * @param game game object
     * @param depth depth at which the algorithm will be operated
     * @param player player object
     * @param best best move object
     * @param index index of the cell to process
     * @returns best move object after cell processing
     */
    private static minimaxCell(
        game: Game,
        depth: number,
        player: Player,
        best: AIComputeResult,
        index: number
    ): AIComputeResult {
        game.updateBoard(player, index);
        const deep = this.minimax(game, depth - 1, getOpponent(player));

        game.updateBoard(Player.None, index);
        deep.move = index;

        const type = AI.getComputeType(player);
        if (type === PlayerComputeType.Computer) {
            if (deep.score > best.score) {
                best = deep;
            }
        } else if (deep.score < best.score) {
            best = deep;
        }

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

    /**
     * Pick an empty cell randomly on the board.
     *
     * @param game game object
     * @returns ai computation result
     */
    private static randomized(game: Game): AIComputeResult {
        const emptyCellIndexes = game.board
            .map((cell, index) => ({ cell, index }))
            .filter(({ cell }) => cell === Player.None)
            .map(({ index }) => index);

        return {
            move: emptyCellIndexes[Math.floor(Math.random() * emptyCellIndexes.length)],
            score: 0
        };
    }
}
