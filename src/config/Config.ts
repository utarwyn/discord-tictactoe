import CommandConfig from '@config/CommandConfig';
import GameConfig from '@config/GameConfig';
import InteractionConfig from '@config/InteractionConfig';

/**
 * Contains the needed configuration values to start the bot.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
export default interface Config extends CommandConfig, GameConfig, InteractionConfig {
    /**
     * Token used to connect to Discord's API.
     */
    token?: string;
    /**
     * Locale of the module.
     */
    language?: string;
}
