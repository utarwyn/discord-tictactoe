import CommandInteractionMessagingTunnel from '@bot/messaging/CommandInteractionMessagingTunnel';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import TextMessagingTunnel from '@bot/messaging/TextMessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import CommandConfig from '@config/CommandConfig';
import localize from '@i18n/localize';
import { GuildMember, Interaction, Message } from 'discord.js';

/**
 * Command to start a duel with someone else.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
export default class GameCommand {
    /**
     * Global game manager of the module.
     * @private
     */
    private readonly manager: GameStateManager;
    /**
     * Configuration of the game command.
     * @private
     */
    private readonly config: CommandConfig;

    /**
     * Constructs the command to start a game.
     *
     * @param manager game state manager
     */
    constructor(manager: GameStateManager) {
        this.manager = manager;
        this.config = manager.bot.configuration;
    }

    /**
     * Handles an incoming message.
     *
     * @param message discord.js message instance
     * @param noTrigger true to bypass trigger checks
     */
    public async handleMessage(message: Message, noTrigger = false): Promise<void> {
        if (
            message.member &&
            !message.author.bot &&
            message.channel.isText() &&
            (noTrigger ||
                (this.config.textCommand && message.content.startsWith(this.config.textCommand)))
        ) {
            const tunnel = new TextMessagingTunnel(message);
            const invited = message.mentions.members?.first();

            return this.processInvitation(tunnel, message.member, invited).catch(error => {
                tunnel.replyWith({ content: localize.__(error) }, true);
            });
        }
    }

    /**
     * Handles an incoming interaction.
     *
     * @param interaction discord.js interaction instance
     * @param noTrigger true to bypass trigger checks
     */
    public async handleInteraction(interaction: Interaction, noTrigger = false): Promise<void> {
        if (
            interaction?.isCommand() &&
            interaction.inCachedGuild() &&
            interaction.channel?.isText() &&
            (noTrigger || interaction.commandName === this.config.command)
        ) {
            // Retrieve the inviter and create an interaction tunnel
            const tunnel = new CommandInteractionMessagingTunnel(interaction);

            // Retrieve invited user from options if provided
            const member = await interaction.member.fetch();
            const mentionned =
                interaction.options.getMember(this.config.commandOptionName ?? 'opponent', false) ??
                undefined;

            return this.processInvitation(tunnel, member, mentionned).catch(error => {
                tunnel.replyWith({ content: localize.__(error) }, true);
            });
        }
    }

    /**
     * Validates and handles an invitation if its valid.
     *
     * @param tunnel game messaging tunnel
     * @param inviter discord.js inviter member instance
     * @param invited discord.js invited member instance, can be undefined to play against AI
     */
    private async processInvitation(
        tunnel: MessagingTunnel,
        inviter: GuildMember,
        invited?: GuildMember
    ): Promise<void> {
        if (invited) {
            if (!invited.user.bot) {
                if (
                    inviter.user.id === invited.user.id ||
                    !invited.permissionsIn(tunnel.channel).has('VIEW_CHANNEL')
                ) {
                    return Promise.reject('duel.unknown-user');
                }
            } else {
                return Promise.reject('duel.no-bot');
            }
        }

        return this.handleInvitation(tunnel, invited);
    }

    /**
     * Handles an invitation by starting a game
     * or requesting a duel between two members.
     *
     * @param tunnel game messaging tunnel
     * @param invited discord.js invited member instance, can be undefined to play against AI
     */
    private async handleInvitation(tunnel: MessagingTunnel, invited?: GuildMember): Promise<void> {
        let handler: Promise<void>;
        if (invited) {
            handler = this.manager.requestDuel(tunnel, invited);
        } else {
            handler = this.manager.createGame(tunnel);
        }
        return handler.catch(() => Promise.reject('game.in-progress'));
    }
}
