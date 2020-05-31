import localize from './config/localize';
import Config from './config/Config';

/**
 * Controls all interactions between modules of the bot.
 * Loads configuration, language files and the client.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class TicTacToeBot {
    private readonly config: Config;

    constructor(config: Config) {
        this.config = config;
        localize.setLanguage(config.language);
    }

    public connect(): void {
        // TODO implement this method
    }
}
