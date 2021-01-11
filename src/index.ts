import { Client } from 'discord.js';
import EventHandler, { EventType } from '@bot/EventHandler';
import TicTacToeBot from '@bot/TicTacToeBot';
import localize from '@config/localize';
import Config from '@config/Config';
import Game from '@tictactoe/Game';

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
    constructor(config: Config, client?: Client) {
        this._config = config;
        this.eventHandler = new EventHandler();
        this.bot = new TicTacToeBot(this, this.eventHandler, client);
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
     * Register a listener to a specific event by its name.
     *
     * @param eventName name of the event to listen
     * @param listener  callback method called when the event is emitted
     */
    public on(eventName: EventType, listener: (data?: any) => void): void {
        this.eventHandler.registerListener(eventName, listener);
    }

    /**
     * Creates a new game object.
     */
    public createGame(): Game {
        return new Game();
    }
}

export = TicTacToe;
