import InteractionMessagingTunnel from '@bot/messaging/InteractionMessagingTunnel';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import TextMessagingTunnel from '@bot/messaging/TextMessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import CommandConfig from '@config/CommandConfig';
import localize from '@i18n/localize';
import { CommandInteraction, GuildMember, Interaction, Message, TextChannel } from 'discord.js';

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
            message.channel instanceof TextChannel &&
            (noTrigger ||
                (this.config.textCommand && message.content.startsWith(this.config.textCommand)))
        ) {
            const tunnel = new TextMessagingTunnel(message);
            const invited = message.mentions.members?.first();

            return this.handleInvitation(tunnel, message.member, invited);
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
            interaction instanceof CommandInteraction &&
            interaction.channel instanceof TextChannel &&
            interaction.member instanceof GuildMember &&
            (noTrigger || interaction.commandName === this.config.command)
        ) {
            // Retrieve the inviter and create an interaction tunnel
            const tunnnel = new InteractionMessagingTunnel(interaction);

            // Retrieve invited user from options if provided
            const mentionned = interaction.options.getMember('opponent', false);
            const invited = mentionned instanceof GuildMember ? mentionned : undefined;

            return this.handleInvitation(tunnnel, interaction.member, invited);
        }
    }

    /**
     * Handles an invitation by starting a game
     * or requesting a duel between two members.
     *
     * @param tunnel game messaging tunnel
     * @param channel
     * @param inviter discord.js inviter member instance
     * @param invited discord.js invited member instance, can be undefined to play against AI
     */
    private async handleInvitation(
        tunnel: MessagingTunnel,
        inviter: GuildMember,
        invited?: GuildMember
    ): Promise<void> {
        if (invited) {
            if (
                !invited.user.bot &&
                inviter.user.id !== invited.user.id &&
                invited.permissionsIn(tunnel.channel).has('VIEW_CHANNEL')
            ) {
                await this.manager.requestDuel(tunnel, invited);
            } else {
                await tunnel.replyWith({ content: localize.__('duel.unknown-user') }, true);
            }
        } else {
            await this.manager.createGame(tunnel);
        }
    }
}
