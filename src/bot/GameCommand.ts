import { GuildMember, Message, TextChannel, User } from 'discord.js';
import TicTacToeBot from '@bot/TicTacToeBot';
import GameChannel from '@bot/channel/GameChannel';
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
     * Amount of seconds to wait after executing command.
     * @private
     */
    private readonly cooldown: number;

    /**
     * List of channel identifiers where the command can be used.
     * @private
     */
    private readonly allowedChannelIds: string[];

    /**
     * List of role identifiers that can use the command.
     * @private
     */
    private readonly allowedRoleIds: string[];

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
     * @param allowedRoleIds list of role identifiers that can use the command.
     */
    constructor(
        bot: TicTacToeBot,
        trigger?: string,
        cooldown = 0,
        allowedChannelIds: string[] = [],
        allowedRoleIds: string[] = []
    ) {
        this.bot = bot;
        this.trigger = trigger;
        this.cooldown = cooldown;
        this.allowedChannelIds = allowedChannelIds;
        this.allowedRoleIds = allowedRoleIds;
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

        if (this.canStartGame(message, channel)) {
            const mentionned = message.mentions.members?.first();

            if (mentionned) {
                if (GameCommand.isUserReadyToPlay(mentionned, message)) {
                    channel!.sendDuelRequest(message, mentionned).catch(console.error);
                } else {
                    message.reply(localize.__('duel.unknown-user')).catch(console.error);
                }
            } else {
                channel!.createGame(message.member!).catch(console.error);
            }
        }
    }

    /**
     * Checks if the command can be executed based on a specific message context.
     *
     * @param message discord.js message
     * @param channel game channel where the game will be starte, can be null
     */
    private canStartGame(message: Message, channel: GameChannel | null): boolean {
        // Disable the command if the channel is not allowed
        if (
            this.allowedChannelIds.length > 0 &&
            !this.allowedChannelIds.includes(message.channel.id)
        ) {
            return false;
        }

        // Check if game channel created
        if (channel == null) {
            const name = (message.channel as TextChannel).name;
            console.error(
                `Cannot operate because of a lack of permissions in the channel #${name}`
            );
            return false;
        }

        // Disable the command if a game is running or member cooldown active
        return (
            !channel.gameRunning &&
            message.member != null &&
            this.isAllowedMemberByRole(message.member) &&
            this.isAllowedUserByCooldown(message.author)
        );
    }

    /**
     * Verifies if a member can run the command based on its roles.
     *
     * @param member discord.js member object
     * @private
     */
    private isAllowedMemberByRole(member: GuildMember): boolean {
        return (
            this.allowedRoleIds.length == 0 ||
            member.permissions.has('ADMINISTRATOR') ||
            member.roles.cache.some(role => this.allowedRoleIds.includes(role.id))
        );
    }

    /**
     * Verifies if an user can run the command based on its cooldown.
     *
     * @param author identifier of message author
     * @private
     */
    private isAllowedUserByCooldown(author: User): boolean {
        if (this.cooldown > 0) {
            if ((this.memberCooldownEndTimes.get(author.id) ?? 0) > Date.now()) {
                return false;
            } else {
                this.memberCooldownEndTimes.set(author.id, Date.now() + this.cooldown * 1000);
            }
        }

        return true;
    }

    /**
     * Retrieves the first valid member mentionned in a message.
     * Should be a real person, who has right permissions and not the requester.
     *
     * @param invited member invited to enter a duel
     * @param invitation message used to invite a member to enter a duel
     * @return true if invited member can duel with the sender, false otherwise
     * @private
     * @static
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
