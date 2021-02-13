/**
 * Configuration values to initialize a gameboard.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.1.0
 */
export default interface GameBoardConfig {
    /**
     * Expiration time of a player turn.
     */
    gameExpireTime?: number;
    /**
     * Should bot needs to delete the game board message.
     */
    gameBoardDelete?: boolean;
}
