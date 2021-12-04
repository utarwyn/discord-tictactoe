import EventHandler, { EventType } from '@bot/EventHandler';
import TicTacToeBot from '@bot/TicTacToeBot';
import Config from '@config/Config';
import localize from '@i18n/localize';
import { Client, Message } from 'discord.js';

/**
 * Controls all interactions between modules of the bot.
 * Loads configuration, language files and the client.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
class TicTacToe {
    /**
     * Bot configuration
     * @private
     */
    private readonly config: Config;
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
     * @param config tictactoe configuration, default if not provided
     * @param client deprecated: if you want to attach a client to the module. Now use attach method.
     */
    constructor(config?: Config, client?: Client) {
        this.config = config ?? {};
        this.eventHandler = new EventHandler();
        this.bot = new TicTacToeBot(this.config, this.eventHandler);

        localize.loadFromLocale(this.config.language);

        // Deprecated, remove this in a next future
        if (client) {
            this.attach(client);
        }
    }

    /**
     * Connects the module through an internal Discord client.
     */
    public async login(token?: string): Promise<void> {
        const loginToken = token ?? this.config.token;

        if (!loginToken) {
            throw new Error('Bot token needed to start Discord client.');
        } else if (!this.config.command && !this.config.slashCommand) {
            throw new Error('Game text or slash command needed to start Discord client.');
        }

        const client = new Client();
        await client.login(loginToken);
        this.bot.attachToClient(client);
    }

    /**
     * Attaches an external Discord Client to the module.
     *
     * @param client Discord.js client instance
     */
    public attach(client: Client): void {
        this.bot.attachToClient(client);
    }

    /**
     * Programmatically handles a discord.js message to request a game.
     *
     * @param message Discord.js message object
     */
    public handleMessage(message: Message): void {
        this.bot.handleMessage(message);
    }

    /**
     * Programmatically handles a discord.js interaction to request a game.
     *
     * @param interaction Discord.js interaction object
     * @param client Discord.js client instance
     */
    public handleInteraction(interaction: any, client: Client): void {
        this.bot.handleInteraction(interaction, client);
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
     * Old method which connects the module through an internal Discord client.
     * Please now use {@link login} method. Will be removed in a next future.
     *
     * @deprecated
     */
    public async connect(): Promise<void> {
        return this.login();
    }
}

export = TicTacToe;
