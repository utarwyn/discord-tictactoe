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
     * Text command used to start a new game.
     */
    textCommand?: string;
}
