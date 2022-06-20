import { GuildMember, Message, TextChannel, WebhookEditMessageOptions } from 'discord.js';

/**
 * Represents a possible answer
 * that can be sent in a messaging tunnel.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export type MessagingAnswer = WebhookEditMessageOptions;

/**
 * Represents a messaging tunnel that
 * accepts an origin object and allows replies to it.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export default abstract class MessagingTunnel {
    /**
     * Retrieves author of the tunnel.
     */
    public abstract get author(): GuildMember;

    /**
     * Retrieves text channel in which tunnel takes place.
     */
    public abstract get channel(): TextChannel;

    /**
     * Retrieves last reply sent through the tunnel.
     * Can be undefined if no reply sent.
     */
    public abstract get reply(): Message | undefined;

    /**
     * Replies something through the messaging tunnel.
     *
     * @param answer anwser to reply with
     * @param direct true if the reply should be direct
     */
    public abstract replyWith(answer: MessagingAnswer, direct?: boolean): Promise<Message>;

    /**
     * Edits the last reply using a specific answer.
     *
     * @param answer answer to update reply with
     */
    public abstract editReply(answer: MessagingAnswer): Promise<void>;

    /**
     * Ends the tunnel and deletes the last reply sent through it.
     *
     * @param reason reason of the tunnel ending
     */
    public abstract end(reason?: MessagingAnswer): Promise<void>;
}
