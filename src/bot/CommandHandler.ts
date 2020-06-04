import Command from './commands/Command';
import { Message } from 'discord.js';

/**
 * Handles all messages representing commands
 * through all servers where the bot is connected.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class CommandHandler {
    /**
     * Map with all triggers of registered commands
     */
    private readonly triggers: Map<string, Command>;

    /**
     * Constructs the command handling service.
     */
    constructor() {
        this.triggers = new Map();
    }

    /**
     * Regiters a command object to be handled bye the bot.
     *
     * @param command command object to register
     */
    public addCommand(command: Command): void {
        command.triggers.forEach(trigger => this.triggers.set(trigger, command));
    }

    /**
     * Called when a user sends a message in a text channel.
     * Formats the message to be handled by the command object.
     *
     * @param message message object with data sent by the user
     */
    public execute(message: Message): void {
        const [command, ...params] = message.content.split(' ');

        if (this.triggers.has(command)) {
            message.content = message.content.substring(command.length + 1);
            this.triggers.get(command)!.run(message, params);
        }
    }
}
