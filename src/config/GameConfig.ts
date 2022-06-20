/**
 * Configuration values to handle a game as wanted.
 *
 * @author Utarwyn
 * @since 2.1.0
 */
export default interface GameConfig {
    /**
     * Expiration time of a player turn.
     */
    gameExpireTime?: number;
    /**
     * Interact with gameboard using reactions instead of buttons.
     */
    gameBoardReactions?: boolean;
    /**
     * Should bot needs to delete the game board message.
     */
    gameBoardDelete?: boolean;
    /**
     * List of emojies used to identify players.
     */
    gameBoardEmojies?: string[];
    /**
     * Should disable buttons after been used.
     */
    gameBoardDisableButtons?: boolean;
}
