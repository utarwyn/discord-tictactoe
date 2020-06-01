import { Client, Message } from 'discord.js';
import TicTacToe from '../index';
import CommandHandler from './CommandHandler';
import DuelCommand from './commands/DuelCommand';

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
    private readonly controller: TicTacToe;
    /**
     * Manages the command handling
     */
    private readonly commandHandler: CommandHandler;

    /**
     * Constructs the Discord bot interaction object.
     *
     * @param controller game controller
     */
    constructor(controller: TicTacToe) {
        super();
        this.controller = controller;
        this.commandHandler = new CommandHandler();

        this.registerCommands();
        this.addEventListeners();
    }

    /**
     * Register all commands to be handled by the bot.
     */
    private registerCommands(): void {
        this.commandHandler.addCommand(new DuelCommand(this.controller));
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
            this.commandHandler.execute(message);
        }
    }
}
