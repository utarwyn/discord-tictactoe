import GameBoardBuilder from '@bot/entity/GameBoardBuilder';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import GameConfig from '@config/GameConfig';
import localize from '@i18n/localize';
import AI from '@tictactoe/AI';
import Entity from '@tictactoe/Entity';
import Game from '@tictactoe/Game';
import { Collection, Message, MessageReaction, Snowflake } from 'discord.js';

/**
 * Message sent to display the status of a game board.
 * Users must use reactions to play in the grid.
 *
 * @author Utarwyn
 * @since 2.0.0
 */
export default class GameBoard {
    /**
     * Tunnel that initiated the game board.
     */
    public readonly tunnel: MessagingTunnel;
    /**
     * Global game state manager.o
     * @private
     */
    private readonly manager: GameStateManager;
    /**
     * Object used to operate the game.
     * @private
     */
    private readonly game: Game;
    /**
     * List of all entities of the game.
     * @private
     */
    private readonly _entities: Array<Entity>;
    /**
     * Game configuration.
     * @private
     */
    private readonly configuration: GameConfig;
    /**
     * Stores reactions state.
     * @private
     */
    private reactionsLoaded: boolean;

    /**
     * Constructs a new game board message.
     *
     * @param manager global game state manager instance
     * @param tunnel messaging tunnel that created the game board
     * @param member2 second member of the game
     * @param configuration custom game configuration
     */
    constructor(
        manager: GameStateManager,
        tunnel: MessagingTunnel,
        member2: Entity,
        configuration: GameConfig
    ) {
        this.manager = manager;
        this.tunnel = tunnel;
        this.game = new Game();
        this._entities = [tunnel.author, member2];
        this.reactionsLoaded = false;
        this.configuration = configuration;
    }

    /**
     * Retrieves entites which are playing on this board.
     */
    public get entities(): Array<Entity> {
        return this._entities;
    }

    /**
     * Creates or retrieves message of the gameboard.
     */
    public get content(): string {
        const builder = new GameBoardBuilder()
            .withTitle(this.entities[0], this.entities[1])
            .withBoard(this.game.boardSize, this.game.board)
            .withEntityPlaying(
                this.reactionsLoaded ? this.getEntity(this.game.currentPlayer) : undefined
            );

        if (this.game.finished) {
            builder.withEndingMessage(this.getEntity(this.game.winner));
        }

        const emojies = this.configuration.gameBoardEmojies;
        if (emojies && emojies.length === 2) {
            builder.withEmojies(emojies[0], emojies[1]);
        }

        return builder.toString();
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
     * Attachs the duel request to a specific message
     * and reacts to it in order to get processed.
     *
     * @param message discord.js message object to attach
     */
    public async attachTo(message: Message): Promise<void> {
        for (const reaction of GameBoardBuilder.MOVE_REACTIONS) {
            try {
                await message.react(reaction);
            } catch {
                await this.onExpire();
                return;
            }
        }

        this.reactionsLoaded = true;
        await this.update();
        await this.attemptNextTurn();
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
        return this.tunnel.editReply(this.content);
    }

    /**
     * Retrieves a game entity based on its playing index.
     *
     * @param index playing index of the entity
     * @private
     */
    private getEntity(index?: number): Entity | undefined {
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

            if (this.configuration.gameBoardDelete) {
                await this.tunnel.end(new GameBoardBuilder().withEndingMessage(winner).toString());
            } else {
                await this.tunnel.reply?.reactions?.removeAll();
                await this.update();
            }

            this.manager.endGame(this, winner ?? null);
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
        await this.tunnel.end(localize.__('game.expire'));
        this.manager.endGame(this);
    }

    /**
     * Waits for the current player to select a move with one reaction below the message.
     * @private
     */
    private awaitMove(): void {
        const expireTime = this.configuration.gameExpireTime ?? 30;
        if (!this.tunnel.reply || this.tunnel.reply.deleted) return;
        this.tunnel.reply
            .awaitReactions(
                (reaction, user) => {
                    return (
                        user.id === this.getEntity(this.game.currentPlayer)?.id &&
                        this.game.isMoveValid(GameBoard.reactionToMove(reaction.emoji.name))
                    );
                },
                { max: 1, time: expireTime * 1000, errors: ['time'] }
            )
            .then(this.onMoveSelected.bind(this))
            .catch(this.onExpire.bind(this));
    }
}
