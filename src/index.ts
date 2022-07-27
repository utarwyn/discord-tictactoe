import EventHandler, { EventType } from '@bot/EventHandler';
import TicTacToeBot from '@bot/TicTacToeBot';
import Config from '@config/Config';
import localize from '@i18n/localize';
import { ChatInputCommandInteraction, Client, GatewayIntentBits, Message } from 'discord.js';

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
     */
    constructor(config?: Config) {
        this.config = config ?? {};
        this.eventHandler = new EventHandler();
        this.bot = new TicTacToeBot(this.config, this.eventHandler);

        localize.loadFromLocale(this.config.language);
    }

    /**
     * Connects the module through an internal Discord client.
     */
    public async login(token?: string): Promise<void> {
        const loginToken = token ?? this.config.token;

        if (!loginToken) {
            throw new Error('Bot token needed to start Discord client.');
        } else if (!this.config.command && !this.config.textCommand) {
            throw new Error('Game slash or text command needed to start Discord client.');
        }

        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                ...(this.config.textCommand ? [GatewayIntentBits.MessageContent] : [])
            ]
        });

        try {
            await client.login(loginToken);
        } catch (e: any) {
            if (e.message?.startsWith('Privileged')) {
                throw new Error('You must enable Message Content intent to use the text command.');
            } else {
                throw e;
            }
        }

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
     * @deprecated use chat command interaction instead
     */
    public handleMessage(message: Message): void {
        this.bot.handleMessage(message);
    }

    /**
     * Programmatically handles a discord.js interaction to request a game.
     *
     * @param interaction Discord.js interaction object
     */
    public handleInteraction(interaction: ChatInputCommandInteraction): void {
        this.bot.handleInteraction(interaction);
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
