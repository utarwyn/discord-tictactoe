import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import {
    BaseMessageOptions,
    GuildMember,
    GuildTextBasedChannel,
    Message,
    TextChannel
} from 'discord.js';

/**
 * Represents a text messaging channel
 * to operate interactions from a text command.
 *
 * @author Utarwyn
 * @since 2.2.0
 * @internal
 */
export default class TextMessagingTunnel extends MessagingTunnel {
    /**
     * Origin message
     * @private
     */
    private readonly origin: Message;
    /**
     * Last reply sent into the tunnnel
     * @private
     */
    private _reply?: Message;

    /**
     * Creates the text messaging tunnel.
     *
     * @param origin origin message
     */
    constructor(origin: Message) {
        super();
        this.origin = origin;
    }

    /**
     * @inheritdoc
     */
    public get author(): GuildMember {
        return this.origin.member!;
    }

    /**
     * @inheritdoc
     */
    public get channel(): TextChannel {
        return this.origin.channel as TextChannel;
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
    public async replyWith(answer: BaseMessageOptions, direct?: boolean): Promise<Message> {
        if (direct) {
            this._reply = await this.origin.reply(answer);
        } else {
            this._reply = await (this.origin.channel as GuildTextBasedChannel).send(answer);
        }
        return this._reply;
    }

    /**
     * @inheritdoc
     */
    public async editReply(answer: BaseMessageOptions): Promise<void> {
        if (this.reply) {
            await this.reply.edit(answer);
        }
    }

    /**
     * @inheritdoc
     */
    public async end(reason: BaseMessageOptions): Promise<void> {
        if (this.reply) {
            if (this.reply.deletable) {
                try {
                    await this.reply.delete();
                } catch {
                    // ignore api error
                }
            }
            await this.channel.send(reason);
            this._reply = undefined;
        }
    }
}
