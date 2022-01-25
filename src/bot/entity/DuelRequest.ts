import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import localize from '@i18n/localize';
import {
    Collection,
    GuildMember,
    Message,
    MessageOptions,
    MessageReaction,
    Snowflake
} from 'discord.js';

/**
 * Message sent when a user challenges someone else to a duel.
 * Invited user must uses reactions to answer the request.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
export default class DuelRequest {
    /**
     * Unicode reactions that the invited user have to use.
     */
    private static readonly REACTIONS = ['👍', '👎'];
    /**
     * Global game state manager.
     */
    private readonly manager: GameStateManager;
    /**
     * Tunnel that initiated the duel request.
     */
    private readonly tunnel: MessagingTunnel;
    /**
     * Member who has been invited to play
     */
    private readonly invited: GuildMember;
    /**
     * Expiration time of a request message
     */
    private readonly expireTime: number;

    /**
     * Constructs a new duel request based on a message.
     *
     * @param manager global game state manager instance
     * @param tunnel messaging tunnel that created the request
     * @param invited invited member object
     * @param expireTime expiration time of the mesage, undefined for default
     */
    constructor(
        manager: GameStateManager,
        tunnel: MessagingTunnel,
        invited: GuildMember,
        expireTime?: number
    ) {
        this.manager = manager;
        this.tunnel = tunnel;
        this.invited = invited;
        this.expireTime = expireTime ?? 60;
    }

    /**
     * Creates the message options to send the duel request.
     *
     * @returns message options object for the duel request
     */
    public get content(): MessageOptions {
        const content =
            localize.__('duel.challenge', {
                invited: this.invited.toString(),
                initier: this.tunnel.author.displayName
            }) +
            '\n' +
            localize.__('duel.action');

        return {
            allowedMentions: { parse: [] },
            embeds: [
                {
                    color: 2719929, // #2980B9
                    title: localize.__('duel.title'),
                    description: content
                }
            ]
        };
    }

    /**
     * Attachs the duel request to a specific message
     * and reacts to it in order to get processed.
     *
     * @param message discord.js message object to attach
     */
    public async attachTo(message: Message): Promise<void> {
        for (const reaction of DuelRequest.REACTIONS) {
            await message.react(reaction);
        }

        message
            .awaitReactions({
                filter: (reaction, user) =>
                    reaction.emoji.name != null &&
                    DuelRequest.REACTIONS.includes(reaction.emoji.name) &&
                    user.id === this.invited.id,
                max: 1,
                time: this.expireTime * 1000,
                errors: ['time']
            })
            .then(this.challengeAnswered.bind(this))
            .catch(this.challengeExpired.bind(this));
    }

    /**
     * Called when the invited user answered to the request.
     *
     * @param collected collection with all reactions added
     */
    private async challengeAnswered(
        collected: Collection<Snowflake, MessageReaction>
    ): Promise<void> {
        if (collected.first()!.emoji.name === DuelRequest.REACTIONS[0]) {
            await this.tunnel.end();
            await this.manager.createGame(this.tunnel, this.invited);
        } else {
            await this.tunnel.end({
                allowedMentions: { parse: [] },
                content: localize.__('duel.reject', { invited: this.invited.displayName })
            });
        }
    }

    /**
     * Called if the challenge has expired without answer.
     */
    private async challengeExpired(): Promise<void> {
        await this.tunnel.end({
            allowedMentions: { parse: [] },
            content: localize.__('duel.expire', { invited: this.invited.displayName })
        });
    }
}
