import Command from './Command';
import { Message } from 'discord.js';
import TicTacToe from '../../index';
import localize from '@config/localize';

/**
 * Command to start a duel with someone else.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class DuelCommand implements Command {
    /**
     * Game controller
     */
    readonly controller: TicTacToe;
    /**
     * @inheritDoc
     */
    readonly triggers: string[];

    /**
     * Constructs a duel command.
     *
     * @param controller game controller
     */
    constructor(controller: TicTacToe) {
        this.controller = controller;
        this.triggers = [controller.config.command!];
    }

    /**
     * @inheritDoc
     */
    run(message: Message, params?: string[]): void {
        message.channel.send(localize.__('welcome'));
        // TODO start a real duel here
    }
}
