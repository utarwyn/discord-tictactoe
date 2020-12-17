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
            const invited = message.mentions.members?.first();
            if (invited && StartCommand.isUserReadyToPlay(invited, message)) {
                channel.sendDuelRequest(message, invited).catch(console.error);
            } else {
                const username = invited?.displayName ?? params[0];
                message.reply(localize.__('duel.unknown-user', { username })).catch(console.error);
            }
        } else {
            channel.createGame(message.member!).catch(console.error);
        }
    }

    /**
     * Retrieves the first valid member mentionned in a message.
     * Should be a real person, who has right permissions and not the requester.
     *
     * @param invited member invited to enter a duel
     * @param invitation message used to invite a member to enter a duel
     * @return true if invited member can duel with the sender, false otherwise
     */
    private static isUserReadyToPlay(invited: GuildMember, invitation: Message): boolean {
        return (
            invited &&
            !invited.user.bot &&
            invitation.member !== invited &&
            invited.permissionsIn(invitation.channel).has('VIEW_CHANNEL')
        );
    }
}
