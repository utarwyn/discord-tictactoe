import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import {
    ChatInputCommandInteraction,
    GuildMember,
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    Message,
    TextChannel
} from 'discord.js';

/**
 * Represents an interaction messaging channel
 * to operate interactions from an application command.
 *
 * @author Utarwyn
 * @since 2.2.0
 * @internal
 */
export default class CommandInteractionMessagingTunnel extends MessagingTunnel {
    /**
     * Interaction object retrieved from the Discord API
     * @private
     */
    private readonly interaction: ChatInputCommandInteraction;
    /**
     * Last reply sent into the tunnnel
     * @private
     */
    private _reply?: Message;

    /**
     * Constructs a new messaging
     * tunnel using Discord interactions.
     *
     * @param interaction interaction generic object
     */
    constructor(interaction: ChatInputCommandInteraction) {
        super();
        this.interaction = interaction;
    }

    /**
     * @inheritdoc
     */
    public get author(): GuildMember {
        return this.interaction.member as GuildMember;
    }

    /**
     * @inheritdoc
     */
    public get channel(): TextChannel {
        return this.interaction.channel as TextChannel;
    }

    /**
     * @inheritdoc
     */
    public get reply(): Message | undefined {
        return this._reply;
    }

    /**
     * @inheritdoc
     */
    public async replyWith(answer: InteractionReplyOptions, direct?: boolean): Promise<Message> {
        // Fetch current reply if deferred externally and not register in this tunnel
        if (!this.reply && this.interaction.deferred) {
            this._reply = await this.interaction.fetchReply();
        }

        // Edit the reply if already exists
        if (this.reply) {
            await this.editReply(answer as InteractionEditReplyOptions);
            return this.reply;
        }

        this._reply = await this.interaction.reply({
            components: [],
            embeds: [],
            ...answer,
            ephemeral: direct,
            fetchReply: true
        });

        return this._reply;
    }

    /**
     * @inheritdoc
     */
    public async editReply(answer: InteractionEditReplyOptions): Promise<void> {
        if (this.reply) {
            await this.interaction.editReply(answer);
        }
    }

    /**
     * @inheritdoc
     */
    public async end(reason: InteractionEditReplyOptions): Promise<void> {
        if (this.reply) {
            try {
                await this.editReply(reason);
                await this.reply.reactions.removeAll();
            } catch {
                // ignore api error
            }
        }
    }
}
