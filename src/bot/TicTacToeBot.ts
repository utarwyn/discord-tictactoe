import { Client, TextChannel } from 'discord.js';
import GameChannel from '@bot/channel/GameChannel';
import EventHandler from '@bot/EventHandler';
import GameCommand from '@bot/GameCommand';
import TicTacToe from '../index';

/**
 * Manages all interactions with the Discord bot.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class TicTacToeBot {
    /**
     * Game controller
     * @private
     */
    private readonly _controller: TicTacToe;
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
     * @param controller   game controller
     * @param eventHandler event handling system
     */
    constructor(controller: TicTacToe, eventHandler: EventHandler) {
        this._controller = controller;
        this._eventHandler = eventHandler;
        this.command = new GameCommand(this, controller.config.command!);
        this._channels = [];
    }

    /**
     * Retrieves the game controller.
     */
    public get controller(): TicTacToe {
        return this._controller;
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
