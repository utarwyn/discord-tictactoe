/**
 * Configuration values to handle commands as wanted.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export default interface CommandConfig {
    /**
     * Text command used to start a new game.
     */
    command?: string;
    /**
     * Slash command used to start a new game.
     */
    slashCommand?: string;
    /**
     * Name of slash command option to request a duel against another user.
     */
    slashCommandOptionName?: string;
}
