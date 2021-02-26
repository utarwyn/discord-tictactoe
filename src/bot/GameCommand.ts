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
    private readonly trigger?: string;

    /**
     * Amount of seconds to wait after executing command
     * @private
     */
    private readonly cooldown: number;

    /**
     * Stores member cooldown end times.
     * @private
     */
    private memberCooldownEndTimes: Map<string, number>;

    /**
     * Constructs the command to start a game.
     *
     * @param bot game client bot
     * @param trigger string whiches triggering command
     * @param cooldown amount of seconds to wait after executing command
     */
    constructor(bot: TicTacToeBot, trigger?: string, cooldown = 0) {
        this.bot = bot;
        this.trigger = trigger;
        this.cooldown = cooldown;
        this.memberCooldownEndTimes = new Map();
    }

    /**
     * Handles an incoming message.
     *
     * @param message discord.js message instance
     */
    public handle(message: Message): void {
        if (
            this.trigger &&
            !message.author.bot &&
            message.channel.isText() &&
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
    public run(message: Message): void {
        const channel = this.bot.getorCreateGameChannel(message.channel as TextChannel);
        const mentionned = message.mentions.members?.first();

        // Disable this command if a game is running or member cooldown active
        if (channel.gameRunning || this.isRefusedDueToCooldown(message.author.id)) {
            return;
        }

        if (mentionned) {
            if (GameCommand.isUserReadyToPlay(mentionned, message)) {
                channel.sendDuelRequest(message, mentionned).catch(console.error);
            } else {
                message.reply(localize.__('duel.unknown-user')).catch(console.error);
            }
        } else {
            channel.createGame(message.member!).catch(console.error);
        }
    }

    /**
     * Verifies if a member can run the command based on its cooldown.
     *
     * @param author identifier of message author
     */
    private isRefusedDueToCooldown(author: string): boolean {
        if (this.cooldown > 0) {
            if ((this.memberCooldownEndTimes.get(author) ?? 0) > Date.now()) {
                return true;
            } else {
                this.memberCooldownEndTimes.set(author, Date.now() + this.cooldown * 1000);
            }
        }

        return false;
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
