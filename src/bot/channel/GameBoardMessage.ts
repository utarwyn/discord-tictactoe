import { Collection, Message, MessageReaction, Snowflake } from 'discord.js';
import localize from '@config/localize';
import GameChannel from '@bot/channel/GameChannel';
import Game from '@tictactoe/Game';
import GameEntity from '@bot/channel/GameEntity';
import AI from '@tictactoe/AI';

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
     * Object used to operate the game.
     */
    private readonly game: Game;
    /**
     * List of all entities of the game.
     */
    private readonly _entities: Array<GameEntity>;
    /**
     * Expiration time of a player turn
     */
    private readonly expireTime: number;
    /**
     * Discord message object managed by the instance.
     */
    private message?: Message;
    /**
     * Stores reactions state.
     */
    private reactionsLoaded: boolean;

    /**
     * Constructs a new game board message.
     *
     * @param channel channel in which the message wil be sent
     * @param game object used to operate the game
     * @param member1 first member of the game
     * @param member2 second member of the game
     * @param expireTime expiration time of a player turn
     */
    constructor(
        channel: GameChannel,
        member1: GameEntity,
        member2: GameEntity,
        expireTime?: number
    ) {
        this.channel = channel;
        this.game = new Game();
        this._entities = [member1, member2];
        this.reactionsLoaded = false;
        this.expireTime = expireTime ?? 30;
    }

    /**
     * Retrieves entites which are playing on this board.
     */
    public get entities(): Array<GameEntity> {
        return this._entities;
    }

    /**
     * Attempts to play the next turn by waiting
     * for the user move or playing with the AI.
     */
    public async attemptNextTurn(): Promise<void> {
        if (this.currentEntity instanceof AI) {
            const result = this.currentEntity.operate(this.game);
            if (result.move !== undefined) {
                await this.playTurn(result.move);
            }
        } else {
            this.awaitMove();
        }
    }

    /**
     * Updates the message.
     */
    public async update(): Promise<void> {
        const text = this.generateText();

        if (!this.message) {
            this.message = await this.channel.channel.send(text);
            for (const reaction of GameBoardMessage.MOVE_REACTIONS) {
                try {
                    await this.message.react(reaction);
                } catch {
                    await this.onExpire();
                    return;
                }
            }

            this.reactionsLoaded = true;
            await this.update();
        } else {
            await this.message.edit(text);
        }
    }

    /**
     * Converts a reaction to a move position (from 0 to 8).
     * If the move is not valid, returns -1.
     *
     * @param reaction unicode reaction
     */
    private static reactionToMove(reaction: string): number {
        return GameBoardMessage.MOVE_REACTIONS.indexOf(reaction);
    }

    /**
     * Retrieves the entity that is playing.
     */
    private get currentEntity(): GameEntity {
        return this._entities[this.game.currentPlayer - 1];
    }

    /**
     * Called when a player has selected a valid move emoji below the message.
     *
     * @param collected collected data from discordjs
     */
    private async onMoveSelected(collected: Collection<Snowflake, MessageReaction>): Promise<void> {
        const move = GameBoardMessage.MOVE_REACTIONS.indexOf(collected.first()!.emoji.name);
        await this.playTurn(move);
    }

    /**
     * Play the current player's turn with a specific move.
     *
     * @param move move to play for the current player
     */
    private async playTurn(move: number): Promise<void> {
        this.game.updateBoard(this.game.currentPlayer, move);

        const winner = this.game.winner;

        if (this.game.boardFull || winner) {
            await this.message?.delete();
            await this.channel.endGame(winner ? this._entities[winner - 1] : undefined);
        } else {
            this.game.nextPlayer();
            await this.update();
            await this.attemptNextTurn();
        }
    }

    /**
     * Called when a player has not played during the expected time.
     */
    private async onExpire(): Promise<void> {
        if (this.message && this.message.deletable && !this.message.deleted) {
            await this.message.delete();
        }
        await this.channel.expireGame();
    }

    /**
     * Waits for the current player to select
     * a move with one reaction below the message.
     */
    private awaitMove(): void {
        if (!this.message || this.message.deleted) return;
        this.message
            .awaitReactions(
                (reaction, user) => {
                    return (
                        user.id === this.currentEntity.id &&
                        this.game.isMoveValid(GameBoardMessage.reactionToMove(reaction.emoji.name))
                    );
                },
                { max: 1, time: this.expireTime * 1000, errors: ['time'] }
            )
            .then(this.onMoveSelected.bind(this))
            .catch(this.onExpire.bind(this));
    }

    /**
     * Generates the text to construct the message.
     */
    private generateText(): string {
        let message;

        // Title part
        message =
            localize.__('game.title', {
                player1: this._entities[0].displayName,
                player2: this._entities[1].displayName
            }) + '\n\n';

        // Board part
        for (let i = 0; i < this.game.boardSize * this.game.boardSize; i++) {
            message += GameBoardMessage.PLAYER_EMOJIS[this.game.board[i]] + ' ';
            if ((i + 1) % this.game.boardSize === 0) {
                message += '\n';
            }
        }

        // Action part
        message += '\n';
        if (this.reactionsLoaded) {
            if (this.currentEntity instanceof AI) {
                message += localize.__('game.waiting-ai');
            } else {
                message += localize.__('game.action', {
                    player: this.currentEntity.toString()
                });
            }
        } else {
            message += localize.__('game.load');
        }

        return message;
    }
}
