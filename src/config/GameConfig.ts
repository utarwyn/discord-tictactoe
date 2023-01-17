export type AIDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Unbeatable';

/**
 * Configuration values to handle a game as wanted.
 *
 * @author Utarwyn
 * @since 2.1.0
 */
export default interface GameConfig {
    /**
     * Level of difficulty of the AI.
     */
    aiDifficulty?: AIDifficulty;
    /**
     * Expiration time of a player turn.
     */
    gameExpireTime?: number;
    /**
     * Should bot needs to delete the game board message.
     */
    gameBoardDelete?: boolean;
    /**
     * Should disable buttons after been used.
     */
    gameBoardDisableButtons?: boolean;
    /**
     * Should use an embed to display the game board.
     */
    gameBoardEmbed?: boolean;
    /**
     * List of emojies used to identify players.
     */
    gameBoardEmojies?: string[];
    /**
     * Interact with game board using reactions instead of buttons.
     */
    gameBoardReactions?: boolean;
}
