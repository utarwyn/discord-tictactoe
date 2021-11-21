import MessagingTunnel, { MessagingAnswer } from '@bot/messaging/MessagingTunnel';
import { Client, GuildMember, Message, TextChannel } from 'discord.js';

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
    private readonly interaction: any;
    /**
     * Discord.js client
     * @private
     */
    private readonly client: Client;
    /**
     * Author of the origin message
     * @private
     */
    private readonly _author: GuildMember;
    /**
     * Channel in which the tunnel has been initiated
     * @private
     */
    private readonly _channel: TextChannel;
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
     * @param client discord.js client innstance
     * @param author author of the tunnel
     * @param channel channel where tunnel takes place
     */
    constructor(interaction: any, client: Client, author: GuildMember, channel: TextChannel) {
        super();
        this.interaction = interaction;
        this.client = client;
        this._author = author;
        this._channel = channel;
    }

    /**
     * @inheritdoc
     */
    public get author(): GuildMember {
        return this._author;
    }

    /**
     * @inheritdoc
     */
    public get channel(): TextChannel {
        return this._channel;
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

        // Post interaction reply using Discord API
        await this.api.interactions(this.interaction.id, this.interaction.token).callback.post({
            data: {
                type: 4,
                data: this.formatDiscordAPIData(answer)
            }
        });

        // Fetch created message from Discord API to use it after in the process
        const messageId = (
            await this.api
                .webhooks(this.interaction.application_id, this.interaction.token)
                .messages('@original')
                .get()
        ).id;

        this._reply = await this.channel.messages.fetch(messageId);
        return this._reply;
    }

    /**
     * @inheritdoc
     */
    public async editReply(answer: MessagingAnswer): Promise<void> {
        if (this.reply) {
            await this.api
                .webhooks(this.interaction.application_id, this.interaction.token)
                .messages('@original')
                .patch({ data: this.formatDiscordAPIData(answer) });
        }
    }

    /**
     * @inheritdoc
     */
    public async end(reason?: string): Promise<void> {
        if (this.reply) {
            try {
                await this.editReply(reason ?? '.');
                await this.reply.suppressEmbeds(true);
                await this.reply.reactions.removeAll();
            } catch {
                // ignore api error
            }
        }
    }

    /**
     * Retrieves the generic client API.
     */
    private get api(): any {
        return this.client['api'];
    }

    /**
     * Formats an answser into a comprehensive Discord API payload.
     *
     * @param answer messaging answer
     * @returns formatted answer to be sent to the Discord API
     */
    private formatDiscordAPIData(answer: MessagingAnswer): any {
        const embed = (answer as any).embed;
        return embed ? { embeds: [embed] } : { content: answer };
    }
}
