import TicTacToeBot from '@bot/TicTacToeBot';
import CommandConfig from '@config/CommandConfig';
import localize from '@i18n/localize';
import { GuildMember, Message, TextChannel, User } from 'discord.js';

/**
 * Command to start a duel with someone else.
 *
 * @author Utarwyn
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
     * @param config custom configuration of the command
     */
    constructor(bot: TicTacToeBot, config: CommandConfig) {
        this.bot = bot;
        this.trigger = config.command;
        this.cooldown = config.requestCooldownTime ?? 0;
        this.allowedChannelIds = config.allowedChannelIds ?? [];
        this.allowedRoleIds = config.allowedRoleIds ?? [];
        this.memberCooldownEndTimes = new Map();
    }

    /**
     * Handles an incoming message.
     *
     * @param message discord.js message instance
     * @param noTrigger true to bypass trigger checks
     */
    public handleMessage(message: Message, noTrigger = false): void {
        if (
            message.member &&
            !message.author.bot &&
            message.channel.isText() &&
            (noTrigger || (this.trigger && message.content.startsWith(this.trigger)))
        ) {
            const replying = this.run(
                message.channel as TextChannel,
                message.member,
                message.mentions.members?.first()
            );

            if (replying) {
                message.reply(replying).catch(console.error);
            }
        }
    }

    /**
     * Process game command and start a match based on the command context.
     *
     * @param channel discord.js text channel object
     * @param inviter member who invited someone to play
     * @param invited member invited to the duel
     * @returns replying message, can be null to do not send answer
     * @private
     */
    public run(channel: TextChannel, inviter: GuildMember, invited?: GuildMember): string | null {
        if (this.isChannelValid(channel)) {
            const gameChannel = this.bot.getorCreateGameChannel(channel);

            if (gameChannel && !gameChannel.gameRunning && this.isMemberAllowed(inviter)) {
                if (invited) {
                    if (this.isInvitationValid(channel, inviter, invited)) {
                        gameChannel.sendDuelRequest(inviter, invited).catch(console.error);
                    } else {
                        return localize.__('duel.unknown-user');
                    }
                } else {
                    gameChannel.createGame(inviter).catch(console.error);
                }
            }
        }

        return null;
    }

    /**
     * Checks if a discord.js channel is able to receive games.
     *
     * @param channel discord.js text channel object
     * @returns true if channel allowed
     * @private
     */
    private isChannelValid(channel: TextChannel): boolean {
        return this.allowedChannelIds.length === 0 || this.allowedChannelIds.includes(channel.id);
    }

    /**
     * Checks if an invitation between two guild members is valid.
     *
     * @param channel discord.js channel object where invitation takes place
     * @param inviter member who invited someone to enter a duel
     * @param invited member invited to enter a duel
     * @returns true if invited member can duel with the sender, false otherwise
     * @private
     */
    private isInvitationValid(
        channel: TextChannel,
        inviter: GuildMember,
        invited: GuildMember
    ): boolean {
        return (
            !invited.user.bot &&
            inviter !== invited &&
            invited.permissionsIn(channel).has('VIEW_CHANNEL')
        );
    }

    /**
     * Checks if the command can be executed for a specific member of the guild.
     *
     * @param member discord.js guild member object
     * @returns true if the game can be started based on member permissions
     * @private
     */
    private isMemberAllowed(member: GuildMember): boolean {
        return this.isMemberAllowedByRole(member) && this.isUserAllowedByCooldown(member.user);
    }

    /**
     * Verifies if a member can run the command based on its roles.
     *
     * @param member discord.js member object
     * @returns true if the member is allowed to start game in that guild
     * @private
     */
    private isMemberAllowedByRole(member: GuildMember): boolean {
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
     * @returns true if the user do not have a valid cooldown in progress
     * @private
     */
    private isUserAllowedByCooldown(author: User): boolean {
        if (this.cooldown > 0) {
            if ((this.memberCooldownEndTimes.get(author.id) ?? 0) > Date.now()) {
                return false;
            } else {
                this.memberCooldownEndTimes.set(author.id, Date.now() + this.cooldown * 1000);
            }
        }

        return true;
    }
}
