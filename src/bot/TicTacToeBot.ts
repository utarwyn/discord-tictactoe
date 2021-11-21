import EventHandler from '@bot/EventHandler';
import GameCommand from '@bot/GameCommand';
import GameStateManager from '@bot/state/GameStateManager';
import Config from '@config/Config';
import { Client, Message } from 'discord.js';

/**
 * Manages all interactions with the Discord bot.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
export default class TicTacToeBot {
    /**
     * Game configuration object
     * @private
     */
    private readonly _configuration: Config;
    /**
     * Manages the command handling
     * @private
     */
    private readonly _eventHandler: EventHandler;
    /**
     * Manages the command handling
     * @private
     */
    private readonly command: GameCommand;

    /**
     * Constructs the Discord bot interaction object.
     *
     * @param configuration game configuration object
     * @param eventHandler event handling system
     */
    constructor(configuration: Config, eventHandler: EventHandler) {
        this._configuration = configuration;
        this._eventHandler = eventHandler;
        this.command = new GameCommand(new GameStateManager(this));
    }

    /**
     * Retrieves the game configuration object.
     */
    public get configuration(): Config {
        return this._configuration;
    }

    /**
     * Retrieves the event handling system.
     */
    public get eventHandler(): EventHandler {
        return this._eventHandler;
    }

    /**
     * Attaches a new Discord client
     * to the module by preparing command handing.
     *
     * @param client discord.js client obbject
     */
    public attachToClient(client: Client): void {
        client.on('messageCreate', this.command.handleMessage.bind(this.command));
    }

    /**
     * Programmatically handles a discord.js message to request a game.
     *
     * @param message Discord.js message object
     */
    public handleMessage(message: Message): void {
        this.command.handleMessage(message, true);
    }
}
