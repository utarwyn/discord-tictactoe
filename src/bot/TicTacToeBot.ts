import { Client, Message, PermissionString, TextChannel } from 'discord.js';
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
     * List with all permissions that the bot needs to work properly.
     * @private
     */
    private static readonly PERM_LIST: PermissionString[] = [
        'ADD_REACTIONS',
        'MANAGE_MESSAGES',
        'READ_MESSAGE_HISTORY',
        'SEND_MESSAGES',
        'VIEW_CHANNEL'
    ];

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
     * @param channel parent Discord channel object
     * @return created game channel, null if bot does not have proper permissions
     */
    public getorCreateGameChannel(channel: TextChannel): GameChannel | null {
        const found = this._channels.find(gameChannel => gameChannel.channel === channel);
        if (found) {
            return found;
        } else if (TicTacToeBot.hasPermissionsInChannel(channel)) {
            const instance = new GameChannel(this, channel);
            this._channels.push(instance);
            return instance;
        } else {
            return null;
        }
    }

    /**
     * Checks if bot has permissions to operate in a specific channel.
     *
     * @param channel discord.js text channel object
     * @return true if bot got all permissions, false otherwise
     */
    private static hasPermissionsInChannel(channel: TextChannel): boolean {
        return channel.guild.me?.permissionsIn(channel)?.has(TicTacToeBot.PERM_LIST) ?? false;
    }
}
