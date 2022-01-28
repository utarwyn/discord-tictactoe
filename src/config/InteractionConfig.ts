/**
 * Configuration about user interaction with the module.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export default interface InteractionConfig {
    /**
     * List of channel identifiers where games can be started.
     */
    allowedChannelIds?: string[];
    /**
     * List of role identifiers that can start a game.
     */
    allowedRoleIds?: string[];
    /**
     * Cooldown time of a duel request.
     */
    requestCooldownTime?: number;
    /**
     * Expiration time of a duel request.
     */
    requestExpireTime?: number;
    /**
     * Interact with a duel request message using reactions instead of buttons.
     */
    requestReactions?: boolean;
    /**
     * Allow games to be played simultaneously in the same channel.
     */
    simultaneousGames?: boolean;
}
