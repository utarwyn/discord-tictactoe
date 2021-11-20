import TextMessagingTunnel from '@bot/messaging/TextMessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import CommandConfig from '@config/CommandConfig';
import localize from '@i18n/localize';
import { GuildMember, Message } from 'discord.js';

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
            (noTrigger || (this.config.command && message.content.startsWith(this.config.command)))
        ) {
            const tunnel = new TextMessagingTunnel(message);
            const invited = message.mentions.members?.first();

            if (invited) {
                if (this.isInvitationValid(message, invited)) {
                    await this.manager.requestDuel(tunnel, invited);
                } else {
                    await message.reply(localize.__('duel.unknown-user'));
                }
            } else {
                await this.manager.createGame(tunnel);
            }
        }
    }

    /**
     * Checks if an invitation between two guild members is valid.
     *
     * @param message discord.js message instance
     * @param invited member invited to enter a duel
     * @returns true if invited member can duel with the sender, false otherwise
     * @private
     */
    private isInvitationValid(message: Message, invited: GuildMember): boolean {
        return (
            !invited.user.bot &&
            message.member !== invited &&
            invited.permissionsIn(message.channel).has('VIEW_CHANNEL')
        );
    }
}
