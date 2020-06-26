import localize from '@config/localize';
import Config from '@config/Config';
import TicTacToeBot from '@bot/TicTacToeBot';
import Game from '@tictactoe/Game';
import { Client } from 'discord.js';

/**
 * Controls all interactions between modules of the bot.
 * Loads configuration, language files and the client.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
class TicTacToe {
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
     * @param client Custom Discord Client to start the bot, can be empty
     */
    constructor(config: Config, client?: Client) {
        this._config = config;
        this.bot = new TicTacToeBot(this, client);
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
        await this.bot.client.login(this.config.token);
    }

    /**
     * Creates a new game object.
     */
    public createGame(): Game {
        return new Game();
    }
}

export = TicTacToe;
