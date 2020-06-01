import localize from '@config/localize';
import Config from '@config/Config';
import TicTacToeBot from '@bot/TicTacToeBot';

/**
 * Controls all interactions between modules of the bot.
 * Loads configuration, language files and the client.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class TicTacToe {
    private readonly _config: Config;
    private readonly bot: TicTacToeBot;

    constructor(config: Config) {
        this._config = config;
        this.bot = new TicTacToeBot(this);
        localize.setLanguage(config.language!);
    }

    public get config(): Config {
        return this._config;
    }

    public async connect(): Promise<void> {
        await this.bot.login(this.config.token);
    }
}
