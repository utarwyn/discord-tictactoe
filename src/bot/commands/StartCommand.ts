import Command from './Command';
import { GuildMember, Message } from 'discord.js';
import localize from '@config/localize';
import TicTacToeBot from '@bot/TicTacToeBot';
import ChallengeMessage from '@bot/messages/ChallengeMessage';

/**
 * Command to start a duel with someone else.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class StartCommand implements Command {
    /**
     * Game controller
     */
    readonly bot: TicTacToeBot;
    /**
     * @inheritDoc
     */
    readonly triggers: string[];

    /**
     * Constructs the command to start a game.
     *
     * @param bot game client bot
     */
    constructor(bot: TicTacToeBot) {
        this.bot = bot;
        this.triggers = [bot.controller.config.command!];
    }

    /**
     * @inheritDoc
     */
    run(message: Message, params?: string[]): void {
        if (params && params.length > 0) {
            const invited = StartCommand.getMentionedUser(message);
            if (invited) {
                new ChallengeMessage(message, invited).send().catch(console.error);
            } else {
                message.channel
                    .send(localize.__('duel.unknown-user', { username: params[0] }))
                    .catch(console.error);
            }
        } else {
            // TODO Duel with an AI
        }
    }

    /**
     * Retrieves the first valid member mentionned in a message.
     * Should be a real person, who has right permissions and not the requester.
     *
     * @param message
     */
    private static getMentionedUser(message: Message): GuildMember | null {
        if (message.mentions.members != null) {
            const invited = message.mentions.members.first();
            if (
                invited &&
                !invited.user.bot &&
                message.member !== invited &&
                invited.permissionsIn(message.channel).has('VIEW_CHANNEL')
            ) {
                return invited;
            }
        }
        return null;
    }
}