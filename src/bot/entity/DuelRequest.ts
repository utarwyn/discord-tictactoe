import ComponentInteractionMessagingTunnel from '@bot/messaging/ComponentInteractionMessagingTunnel';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import { EmbedColor } from '@config/types';
import localize from '@i18n/localize';
import {
    Collection,
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
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
     * Member who has been invited to play
     */
    private readonly invited: GuildMember;
    /**
     * Expiration time of a request message
     */
    private readonly expireTime: number;
    /**
     * Interact with reactions instead of buttons
     */
    private readonly useReactions: boolean;
    /**
     * Color used for the embed.
     */
    private readonly embedColor: EmbedColor;
    /**
     * Tunnel that initiated the duel request.
     */
    private tunnel: MessagingTunnel;

    /**
     * Constructs a new duel request based on a message.
     *
     * @param manager global game state manager instance
     * @param tunnel messaging tunnel that created the request
     * @param invited invited member object
     * @param expireTime expiration time of the mesage, undefined for default
     * @param useReactions interact with reactions instead of buttons
     * @param embedColor color used for the embed
     */
    constructor(
        manager: GameStateManager,
        tunnel: MessagingTunnel,
        invited: GuildMember,
        expireTime?: number,
        useReactions?: boolean,
        embedColor?: EmbedColor
    ) {
        this.manager = manager;
        this.tunnel = tunnel;
        this.invited = invited;
        this.expireTime = expireTime ?? 60;
        this.useReactions = useReactions ?? false;
        this.embedColor = embedColor ?? 2719929;
    }

    /**
     * Creates the message options to send the duel request.
     *
     * @returns message options object for the duel request
     */
    public get content(): MessageOptions {
        const content =
            localize.__('duel.challenge', { initier: this.tunnel.author.displayName }) +
            '\n' +
            localize.__('duel.action');

        return {
            allowedMentions: { parse: ['users'] },
            components: !this.useReactions
                ? [
                      new MessageActionRow().addComponents(
                          new MessageButton({
                              style: 'SUCCESS',
                              customId: 'yes',
                              label: localize.__('duel.button.accept')
                          }),
                          new MessageButton({
                              style: 'DANGER',
                              customId: 'no',
                              label: localize.__('duel.button.decline')
                          })
                      )
                  ]
                : [],
            content: this.invited.toString(),
            embeds: [
                {
                    color: this.embedColor,
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
        if (this.useReactions) {
            for (const reaction of DuelRequest.REACTIONS) {
                await message.react(reaction);
            }

            return message
                .awaitReactions({
                    filter: (reaction, user) =>
                        reaction.emoji.name != null &&
                        DuelRequest.REACTIONS.includes(reaction.emoji.name) &&
                        user.id === this.invited.id,
                    max: 1,
                    time: this.expireTime * 1000,
                    errors: ['time']
                })
                .then(this.challengeEmojiAnswered.bind(this))
                .catch(this.challengeExpired.bind(this));
        } else {
            message
                .createMessageComponentCollector({
                    filter: interaction => interaction.user.id === this.invited.id,
                    max: 1,
                    time: this.expireTime * 1000
                })
                .on('collect', this.challengeButtonAnswered.bind(this))
                .on('end', async (_, reason) => {
                    if (reason !== 'limit') {
                        return this.challengeExpired();
                    }
                });
        }
    }

    /**
     * Called when the invited user answered to the request using a button.
     *
     * @param interaction interaction that has operated challenge answer
     * @private
     */
    private async challengeButtonAnswered(interaction: MessageComponentInteraction): Promise<void> {
        // now that an interaction using buttons has been operated on message, use it
        this.tunnel = new ComponentInteractionMessagingTunnel(interaction, this.tunnel.author);
        return this.challengeAnswered(interaction.customId === 'yes');
    }

    /**
     * Called when the invited user answered to the request using an emoji.
     *
     * @param collected collection with all reactions added
     */
    private async challengeEmojiAnswered(
        collected: Collection<Snowflake, MessageReaction>
    ): Promise<void> {
        return this.challengeAnswered(collected.first()!.emoji.name === DuelRequest.REACTIONS[0]);
    }

    /**
     * Called when the invited user answered to the request.
     *
     * @param accepted true if user accepted the request, false otherwise
     */
    private async challengeAnswered(accepted: boolean): Promise<void> {
        if (accepted) {
            return this.manager.createGame(this.tunnel, this.invited);
        } else {
            return this.tunnel.end({
                allowedMentions: { parse: [] },
                components: [],
                content: localize.__('duel.reject', { invited: this.invited.displayName }),
                embeds: []
            });
        }
    }

    /**
     * Called if the challenge has expired without answer.
     */
    private async challengeExpired(): Promise<void> {
        return this.tunnel.end({
            allowedMentions: { parse: [] },
            components: [],
            content: localize.__('duel.expire', { invited: this.invited.displayName }),
            embeds: []
        });
    }
}
