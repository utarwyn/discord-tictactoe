import { Client } from 'discord.js';
import EventHandler, { EventType } from '@bot/EventHandler';
import TicTacToeBot from '@bot/TicTacToeBot';
import localize from '@config/localize';
import Config from '@config/Config';

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
     * @private
     */
    private readonly _config: Config;
    /**
     * Internal event handling system
     * @private
     */
    private readonly eventHandler: EventHandler;
    /**
     * Connection handling service to Discord
     * @private
     */
    private readonly bot: TicTacToeBot;

    /**
     * Constructs the game controller.
     *
     * @param config tictactoe configuration
     * @param client Custom Discord Client to start the bot, can be empty
     */
    constructor(config?: Config) {
        this._config = config ?? {};
        this.eventHandler = new EventHandler();
        this.bot = new TicTacToeBot(this, this.eventHandler);

        if (this.config.language) {
            localize.setLanguage(this.config.language);
        }
    }

    /**
     * Retrieves configuration of the bot.
     */
    public get config(): Config {
        return this._config;
    }

    /**
     * Connects the module through an internal Discord client.
     */
    public async login(token?: string): Promise<void> {
        const loginToken = token ?? this.config.token;

        if (!loginToken) {
            throw new Error('Bot token needed to start Discord client.');
        } else if (!this.config.command) {
            throw new Error('Game command needed to start Discord client.');
        }

        const client = new Client();
        this.bot.attachToClient(client);
        await client.login(loginToken);
    }

    /**
     * Attaches an external Discord Client to the module.
     */
    public attach(client: Client): void {
        this.bot.attachToClient(client);
    }

    /**
     * Register a listener to a specific event by its name.
     *
     * @param eventName name of the event to listen
     * @param listener  callback method called when the event is emitted
     */
    public on(eventName: EventType, listener: (data?: any) => void): void {
        this.eventHandler.registerListener(eventName, listener);
    }
}

export = TicTacToe;
