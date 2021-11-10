/**
 * Configuration values to handle commands as wanted.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export default interface CommandConfig {
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
}
