import Command from './Command';
import { GuildMember, Message, TextChannel } from 'discord.js';
import localize from '@config/localize';
import TicTacToeBot from '@bot/TicTacToeBot';

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
        const channel = this.bot.getorCreateGameChannel(message.channel as TextChannel);
        // Disable this command if a game is running
        if (channel.gameRunning) {
            return;
        }

        if (params && params.length > 0) {
            const invited = StartCommand.getMentionedUser(message);
            if (invited) {
                channel.sendDuelRequest(message, invited).catch(console.error);
            } else {
                message.channel
                    .send(localize.__('duel.unknown-user', { username: params[0] }))
                    .catch(console.error);
            }
        } else {
            channel.createGame(message.member!).catch(console.error);
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
                invited.user.presence.status !== 'offline' &&
                invited.permissionsIn(message.channel).has('VIEW_CHANNEL')
            ) {
                return invited;
            }
        }
        return null;
    }
}
