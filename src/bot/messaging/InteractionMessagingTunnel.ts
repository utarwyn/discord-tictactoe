import MessagingTunnel, { MessagingAnswer } from '@bot/messaging/MessagingTunnel';
import { CommandInteraction, GuildMember, Message, TextChannel } from 'discord.js';

/**
 * Represents an interaction messaging channel
 * to operate interactions from an application command.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export default class InteractionMessagingTunnel extends MessagingTunnel {
    /**
     * Interaction object retrieved from the Discord API
     * @private
     */
    private readonly interaction: CommandInteraction;
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
    constructor(interaction: CommandInteraction) {
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
    public async replyWith(answer: MessagingAnswer, _direct?: boolean): Promise<Message> {
        // Edit the reply if already exists
        if (this.reply) {
            await this.editReply(answer);
            return this.reply;
        }

        this._reply = (await this.interaction.reply({
            ...answer,
            fetchReply: true
        })) as Message;

        return this._reply;
    }

    /**
     * @inheritdoc
     */
    public async editReply(answer: MessagingAnswer): Promise<void> {
        if (this.reply) {
            await this.interaction.editReply(answer);
        }
    }

    /**
     * @inheritdoc
     */
    public async end(reason?: string): Promise<void> {
        if (this.reply) {
            try {
                await this.editReply({ content: reason ?? '.' });
                await this.reply.suppressEmbeds(true);
                await this.reply.reactions.removeAll();
            } catch {
                // ignore api error
            }
        }
    }
}
