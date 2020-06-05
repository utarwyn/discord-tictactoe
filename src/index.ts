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
    /**
     * Bot configuration
     */
    private readonly _config: Config;
    /**
     * Connection handling service to Discord
     */
    private readonly bot: TicTacToeBot;

    /**
     * Constructs the game controller.
     *
     * @param config tictactoe configuration
     */
    constructor(config: Config) {
        this._config = config;
        this.bot = new TicTacToeBot(this);
        localize.setLanguage(config.language!);
    }

    /**
     * Retrieves configuration of the bot.
     */
    public get config(): Config {
        return this._config;
    }

    /**
     * Connects the client to Discord.
     */
    public async connect(): Promise<void> {
        await this.bot.login(this.config.token);
    }
}
