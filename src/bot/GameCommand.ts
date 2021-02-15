import { GuildMember, Message, TextChannel } from 'discord.js';
import TicTacToeBot from '@bot/TicTacToeBot';
import localize from '@config/localize';

/**
 * Command to start a duel with someone else.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class GameCommand {
    /**
     * Game bot handling object.
     * @private
     */
    private readonly bot: TicTacToeBot;

    /**
     * Trigger of the command.
     * @private
     */
    private readonly trigger: string;

    /**
     * Constructs the command to start a game.
     *
     * @param bot game client bot
     * @param trigger string whiches triggering command
     */
    constructor(bot: TicTacToeBot, trigger: string) {
        this.bot = bot;
        this.trigger = trigger;
    }

    /**
     *
     * @param message
     */
    public handle(message: Message): void {
        if (
            !message.author.bot &&
            message.channel.type === 'text' &&
            message.content.startsWith(this.trigger)
        ) {
            this.run(message);
        }
    }

    /**
     * Executes the command behavior.
     *
     * @param message discord message object
     * @private
     */
    private run(message: Message): void {
        const channel = this.bot.getorCreateGameChannel(message.channel as TextChannel);
        const hasCustomParam = message.content.substring(this.trigger.length + 1).trim().length > 0;

        // Disable this command if a game is running
        if (channel.gameRunning) {
            return;
        }

        if (hasCustomParam) {
            const invited = message.mentions.members?.first();
            if (invited && GameCommand.isUserReadyToPlay(invited, message)) {
                channel.sendDuelRequest(message, invited).catch(console.error);
            } else {
                message.reply(localize.__('duel.unknown-user')).catch(console.error);
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
