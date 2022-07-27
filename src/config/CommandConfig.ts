/**
 * Configuration values to handle commands as wanted.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export default interface CommandConfig {
    /**
     * Slash command used to start a new game.
     */
    command?: string;
    /**
     * Name of command option to request a duel against another user.
     */
    commandOptionName?: string;
    /**
     * Text command used to start a new game.
     *
     * @deprecated use chat command interaction instead
     */
    textCommand?: string;
}
