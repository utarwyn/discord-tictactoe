import {
    Collection,
    GuildMember,
    Message,
    MessageEmbed,
    MessageReaction,
    Snowflake
} from 'discord.js';
import localize from '@config/localize';

/**
 * Message sent when a user challenge someone else to a duel.
 * Invited user must uses reactions to answer to the request.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class ChallengeMessage {
    /**
     * Unicode reactions that the invited user have to use.
     */
    private static readonly REACTIONS = ['👍', '👎'];
    /**
     * Message sent by the user who wants to start a duel.
     */
    private readonly request: Message;
    /**
     * Invited member in the same guild.
     */
    private readonly invited: GuildMember;
    /**
     * Message object sent in the channel.
     */
    private message?: Message;

    /**
     * Constructs a new challenge message.
     *
     * @param message request message object
     * @param invited invited user object
     */
    constructor(message: Message, invited: GuildMember) {
        this.request = message;
        this.invited = invited;
    }

    /**
     * Send the challenge embed message in the channel.
     */
    public async send(): Promise<void> {
        this.message = await this.request.channel.send(this.createEmbed());
        for (const reaction of ChallengeMessage.REACTIONS) {
            await this.message.react(reaction);
        }

        this.message
            .awaitReactions(
                (reaction, user) => {
                    return (
                        ChallengeMessage.REACTIONS.includes(reaction.emoji.name) &&
                        user.id === this.invited.id
                    );
                },
                { max: 1, time: 60000, errors: ['time'] }
            )
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
        const reaction = collected.first();
        // TODO create a new game here
        console.log('reacted with', reaction?.emoji.name);
    }

    /**
     * Called if the challenge has expired without answer.
     */
    private async challengeExpired(): Promise<void> {
        await this.message!.delete();
        await this.request.channel.send(
            localize.__('duel.expire', { invited: this.invited.displayName })
        );
    }

    /**
     * Constructs the Discord object to send in the channel.
     */
    private createEmbed(): MessageEmbed {
        return new MessageEmbed()
            .setColor('#2980b9')
            .setTitle(localize.__('duel.title'))
            .setDescription(
                localize.__('duel.challenge', {
                    invited: this.invited.toString(),
                    initier: this.request.member?.displayName!
                }) +
                    '\n' +
                    localize.__('duel.action')
            );
    }
}
