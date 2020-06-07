import { GuildMember, Message } from 'discord.js';
import localize from '@config/localize';
import GameChannel from '@bot/channel/GameChannel';
import Game from '@tictactoe/Game';

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
     * Unicode emojis used for representing the two players.
     */
    private static readonly PLAYER_EMOJIS = ['⬜', '🇽', '🅾️'];
    /**
     * Channel object in which the game board has to be displayed.
     */
    private readonly channel: GameChannel;
    /**
     * List of all members of the game.
     */
    private readonly members: Array<GuildMember>;
    /**
     * Object used to operate the game.
     */
    private readonly game: Game;
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
     * @param game object used to operate the game
     */
    constructor(channel: GameChannel, member1: GuildMember, member2: GuildMember, game: Game) {
        this.channel = channel;
        this.members = [member1, member2];
        this.game = game;
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
        let message;

        // Title part
        message =
            localize.__('game.title', {
                player1: this.members[0].displayName,
                player2: this.members[1].displayName
            }) + '\n\n';

        // Board part
        for (let i = 0; i < this.game.boardSize * this.game.boardSize; i++) {
            message += GameBoardMessage.PLAYER_EMOJIS[this.game.board[i]];
            if ((i + 1) % this.game.boardSize === 0) {
                message += '\n';
            }
        }

        // Action part
        message +=
            '\n' +
            localize.__('game.action', {
                player: this.members[this.game.currentPlayer - 1].toString()
            });

        return message;
    }
}
