import { GuildMember, Message } from 'discord.js';
import localize from '@config/localize';
import GameChannel from '@bot/channel/GameChannel';

/**
 * Message sent to display the status of a game board.
 * Users must use reactions to play in the grid.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class GameBoardMessage {
    /**
     * Unicode reactions available for moves.
     */
    private static readonly MOVE_REACTIONS = ['↖️', '⬆️', '↗️', '⬅️', '⏺️', '➡️', '↙️', '⬇️', '↘️'];
    /**
     * Channel object in which the game board has to be displayed.
     */
    private readonly channel: GameChannel;
    /**
     * First member of the game.
     */
    private readonly member1: GuildMember;
    /**
     * Second member of the game.
     */
    private readonly member2: GuildMember;
    /**
     * Discord message object managed by the instance.
     */
    private message?: Message;

    /**
     * Constructs a new game board message.
     *
     * @param channel channel in which the message wil be sent
     * @param member1 first member of the game
     * @param member2 second member of the game
     */
    constructor(channel: GameChannel, member1: GuildMember, member2: GuildMember) {
        this.channel = channel;
        this.member1 = member1;
        this.member2 = member2;
    }

    /**
     * Updates the message.
     */
    public async update(): Promise<void> {
        const text = this.generateText();

        if (!this.message) {
            this.message = await this.channel.channel.send(text);
            for (const reaction of GameBoardMessage.MOVE_REACTIONS) {
                await this.message.react(reaction);
            }
        } else {
            await this.message.edit(text);
        }
    }

    /**
     * Generates the text to construct the message.
     */
    private generateText(): string {
        let message = localize.__('game.title') + '\n       ';
        message += localize.__('game.versus', {
            player1: this.member1.displayName,
            player2: this.member2.displayName
        });
        return message;
    }
}
