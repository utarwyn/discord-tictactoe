/**
 * Contains the needed configuration values to start the bot.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
export default interface Config {
    /**
     * Token used to connect to Discord's API.
     */
    token?: string;
    /**
     * Locale of the module.
     */
    language?: string;
    /**
     * Command to type to start a new tictactoe game.
     */
    command?: string;
    /**
     * List of channel identifiers where games can be started.
     */
    allowedChannelIds?: string[];
    /**
     * List of role identifiers that can start a game.
     */
    allowedRoleIds?: string[];
    /**
     * Expiration time of a duel request.
     */
    requestExpireTime?: number;
    /**
     * Cooldown time of a duel request.
     */
    requestCooldownTime?: number;
    /**
     * Expiration time of a player turn.
     */
    gameExpireTime?: number;
    /**
     * Should bot needs to delete the game board message.
     */
    gameBoardDelete?: boolean;
    /**
     * List of emojies used to identify players.
     */
    gameBoardEmojies?: string[];
}
