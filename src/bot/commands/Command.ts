import { Message } from 'discord.js';

/**
 * Represents an executable command by a user.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default interface Command {
    /**
     * Collection with all triggers of this command
     */
    readonly triggers: string[];

    /**
     * Called when a user send a message representing the command.
     *
     * @param message message sent by the user
     * @param params params received after the command
     */
    run(message: Message, params?: string[]): void;
}
