import { Client, Message, TextChannel } from 'discord.js';
import GameChannel from '@bot/channel/GameChannel';
import EventHandler from '@bot/EventHandler';
import GameCommand from '@bot/GameCommand';
import Config from '@config/Config';

/**
 * Manages all interactions with the Discord bot.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
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
     * Collection with all channels in which games are handled.
     * @private
     */
    private _channels: Array<GameChannel>;

    /**
     * Constructs the Discord bot interaction object.
     *
     * @param configuration game configuration object
     * @param eventHandler event handling system
     */
    constructor(configuration: Config, eventHandler: EventHandler) {
        this._configuration = configuration;
        this._eventHandler = eventHandler;
        this._channels = [];
        this.command = new GameCommand(
            this,
            configuration.command,
            configuration.requestCooldownTime
        );
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
     * Attaches a new Discord client to the module by preparing command handing.
     */
    public attachToClient(client: Client): void {
        client.on('message', this.command.handle.bind(this.command));
    }

    /**
     * Programmatically handles a discord.js message to request a game.
     *
     * @param message Discord.js message object
     */
    public handleMessage(message: Message): void {
        this.command.run(message);
    }

    /**
     * Retrieves a game channel from the Discord object.
     * Creates a new game channel innstance if not found in the cache.
     *
     * @param parent parent Discord channel object
     */
    public getorCreateGameChannel(parent: TextChannel): GameChannel {
        const found = this._channels.find(channel => channel.channel === parent);
        if (found) {
            return found;
        } else {
            const instance = new GameChannel(this, parent);
            this._channels.push(instance);
            return instance;
        }
    }
}
