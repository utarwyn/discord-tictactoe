import { Client, Message } from 'discord.js';
import TicTacToe from '../index';
import CommandHandler from './CommandHandler';
import StartCommand from './commands/StartCommand';

/**
 * Manages all interactions with the Discord bot.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class TicTacToeBot extends Client {
    /**
     * Game controller
     */
    private readonly _controller: TicTacToe;
    /**
     * Manages the command handling
     */
    private readonly _commandHandler: CommandHandler;

    /**
     * Constructs the Discord bot interaction object.
     *
     * @param controller game controller
     */
    constructor(controller: TicTacToe) {
        super();
        this._controller = controller;
        this._commandHandler = new CommandHandler();

        this.registerCommands();
        this.addEventListeners();
    }

    /**
     * Retrieves the game controller.
     */
    public get controller(): TicTacToe {
        return this._controller;
    }

    /**
     * Register all commands to be handled by the bot.
     */
    private registerCommands(): void {
        this._commandHandler.addCommand(new StartCommand(this));
    }

    /**
     * Register all events to be handled by the bot.
     */
    private addEventListeners(): void {
        this.on('message', this.onMessage);
    }

    /**
     * Called when a message is sent and has been detected by the bot.
     *
     * @param message message object received from Discord
     */
    private onMessage(message: Message): void {
        if (!message.author.bot && message.channel.type === 'text') {
            this._commandHandler.execute(message);
        }
    }
}
