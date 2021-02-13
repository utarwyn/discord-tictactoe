import { Collection, Message, MessageReaction, Snowflake } from 'discord.js';
import GameChannel from '@bot/channel/GameChannel';
import GameEntity from '@bot/channel/GameEntity';
import GameBoardBuilder from '@bot/gameboard/GameBoardBuilder';
import GameBoardConfig from '@bot/gameboard/GameBoardConfig';
import AI from '@tictactoe/AI';
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
     * Game board configuration.
     */
    private readonly configuration?: GameBoardConfig;
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
     * @param member1 first member of the game
     * @param member2 second member of the game
     * @param configuration custom configuration of the gameboard
     */
    constructor(
        channel: GameChannel,
        member1: GameEntity,
        member2: GameEntity,
        configuration?: GameBoardConfig
    ) {
        this.channel = channel;
        this.game = new Game();
        this._entities = [member1, member2];
        this.reactionsLoaded = false;
        this.configuration = configuration;
    }

    /**
     * Retrieves entites which are playing on this board.
     */
    public get entities(): Array<GameEntity> {
        return this._entities;
    }

    /**
     * Converts a reaction to a move position (from 0 to 8).
     * If the move is not valid, returns -1.
     *
     * @param reaction unicode reaction
     * @private
     */
    private static reactionToMove(reaction: string): number {
        return GameBoardBuilder.MOVE_REACTIONS.indexOf(reaction);
    }

    /**
     * Attempts to play the next turn by waiting
     * for the user move or playing with the AI.
     */
    public async attemptNextTurn(): Promise<void> {
        const currentEntity = this.getEntity(this.game.currentPlayer);
        if (currentEntity instanceof AI) {
            const result = currentEntity.operate(this.game);
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
        const builder = new GameBoardBuilder()
            .withTitle(this.entities[0], this.entities[1])
            .withBoard(this.game.boardSize, this.game.board)
            .withEntityPlaying(
                this.reactionsLoaded ? this.getEntity(this.game.currentPlayer) : undefined
            );

        if (this.game.finished) {
            builder.withEndingMessage(this.getEntity(this.game.winner));
        }

        if (!this.message) {
            this.message = await this.channel.channel.send(builder.toString());
            for (const reaction of GameBoardBuilder.MOVE_REACTIONS) {
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
            await this.message.edit(builder.toString());
        }
    }

    /**
     * Retrieves a game entity based on its playing index.
     *
     * @param index playing index of the entity
     * @private
     */
    private getEntity(index?: number): GameEntity | undefined {
        return index && index > 0 ? this._entities[index - 1] : undefined;
    }

    /**
     * Called when a player has selected a valid move emoji below the message.
     *
     * @param collected collected data from discordjs
     * @private
     */
    private async onMoveSelected(collected: Collection<Snowflake, MessageReaction>): Promise<void> {
        const move = GameBoardBuilder.MOVE_REACTIONS.indexOf(collected.first()!.emoji.name);
        await this.playTurn(move);
    }

    /**
     * Play the current player's turn with a specific move.
     *
     * @param move move to play for the current player
     * @private
     */
    private async playTurn(move: number): Promise<void> {
        this.game.updateBoard(this.game.currentPlayer, move);

        if (this.game.finished) {
            const winner = this.getEntity(this.game.winner);

            if (this.configuration?.gameBoardDelete) {
                await this.message?.delete();
                await this.channel.channel.send(
                    new GameBoardBuilder().withEndingMessage(winner).toString()
                );
            } else {
                await this.message?.reactions?.removeAll();
                await this.update();
            }

            this.channel.endGame(winner);
        } else {
            this.game.nextPlayer();
            await this.update();
            await this.attemptNextTurn();
        }
    }

    /**
     * Called when a player has not played during the expected time.
     * @private
     */
    private async onExpire(): Promise<void> {
        if (this.message && this.message.deletable && !this.message.deleted) {
            await this.message.delete();
        }
        await this.channel.expireGame();
    }

    /**
     * Waits for the current player to select a move with one reaction below the message.
     * @private
     */
    private awaitMove(): void {
        const expireTime = this.configuration?.gameExpireTime ?? 30;
        if (!this.message || this.message.deleted) return;
        this.message
            .awaitReactions(
                (reaction, user) => {
                    return (
                        user.id === this.getEntity(this.game.currentPlayer)?.id &&
                        this.game.isMoveValid(GameBoardMessage.reactionToMove(reaction.emoji.name))
                    );
                },
                { max: 1, time: expireTime * 1000, errors: ['time'] }
            )
            .then(this.onMoveSelected.bind(this))
            .catch(this.onExpire.bind(this));
    }
}
