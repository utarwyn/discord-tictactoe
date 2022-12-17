/**
 * Represents a result of an AI computation.
 *
 * @author Utarwyn
 * @since 2.0.0
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
