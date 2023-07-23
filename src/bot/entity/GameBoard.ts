import GameBoardBuilder from '@bot/builder/GameBoardBuilder';
import GameBoardButtonBuilder from '@bot/builder/GameBoardButtonBuilder';
import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import GameConfig from '@config/GameConfig';
import AI from '@tictactoe/ai/AI';
import Entity from '@tictactoe/Entity';
import Game from '@tictactoe/Game';
import {
    ButtonInteraction,
    Collection,
    Message,
    MessageReaction,
    Snowflake,
    WebhookEditMessageOptions
} from 'discord.js';

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
     * Stores if the game has expired.
     * @private
     */
    private expired: boolean;

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
        this.expired = false;
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
    public get content(): WebhookEditMessageOptions {
        const builder = this.createBuilder();

        builder
            .withTitle(this.entities[0], this.entities[1])
            .withBoard(this.game.boardSize, this.game.board)
            .withEntityPlaying(
                this.reactionsLoaded ? this.getEntity(this.game.currentPlayer) : undefined
            );

        if (this.expired) {
            builder.withExpireMessage();
        } else if (this.game.finished) {
            builder.withEndingMessage(this.getEntity(this.game.winner));
        }

        const emojies = this.configuration.gameBoardEmojies;
        if (emojies && [2, 3].includes(emojies.length)) {
            builder.withEmojies(emojies[0], emojies[1], emojies[2]);
        }

        if (
            this.configuration.gameBoardDisableButtons &&
            builder instanceof GameBoardButtonBuilder
        ) {
            builder.withButtonsDisabledAfterUse();
        }

        return builder.toMessageOptions();
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
     * Converts a button identifier to a move position (from 0 to 8).
     * If the move is not valid, returns -1.
     *
     * @param identifier button identifier
     * @private
     */
    private static buttonIdentifierToMove(identifier: string): number {
        return parseInt(identifier) ?? -1;
    }

    /**
     * Attachs the duel request to a specific message
     * and reacts to it in order to get processed.
     *
     * @param message discord.js message object to attach
     */
    public async attachTo(message: Message): Promise<void> {
        // Add reactions below message if enabled
        if (this.configuration.gameBoardReactions) {
            for (const reaction of GameBoardBuilder.MOVE_REACTIONS) {
                try {
                    await message.react(reaction);
                } catch {
                    await this.onExpire();
                    return;
                }
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
     *
     * @param interaction interaction to update if action was triggered by it
     */
    public async update(interaction?: ButtonInteraction): Promise<void> {
        if (interaction) {
            return interaction.update(this.content);
        } else {
            return this.tunnel.editReply(this.content);
        }
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
    private async onEmojiMoveSelected(
        collected: Collection<Snowflake, MessageReaction>
    ): Promise<void> {
        const move = GameBoardBuilder.MOVE_REACTIONS.indexOf(collected.first()!.emoji.name!);
        return this.playTurn(move);
    }

    /**
     * Called when a player has selected a valid move button.
     *
     * @param interaction interaction that has operated move request
     * @private
     */
    private async onButtonMoveSelected(interaction: ButtonInteraction): Promise<void> {
        const move = GameBoard.buttonIdentifierToMove(interaction.customId);
        return this.playTurn(move, interaction);
    }

    /**
     * Play the current player's turn with a specific move.
     *
     * @param move move to play for the current player
     * @param interaction interaction to update if action was triggered by it
     * @private
     */
    private async playTurn(move: number, interaction?: ButtonInteraction): Promise<void> {
        this.game.updateBoard(this.game.currentPlayer, move);

        if (this.game.finished) {
            return this.end(this.getEntity(this.game.winner) ?? null, interaction);
        } else {
            this.game.nextPlayer();
            await this.update(interaction);
            await this.attemptNextTurn();
        }
    }

    /**
     * Called when a player has not played during the expected time.
     * @private
     */
    private async onExpire(): Promise<void> {
        this.expired = true;
        return this.end();
    }

    /**
     * Creates a builder based on the game configuration.
     *
     * @returns game board builder
     * @private
     */
    private createBuilder(): GameBoardBuilder {
        const builder = this.configuration.gameBoardReactions
            ? new GameBoardBuilder()
            : new GameBoardButtonBuilder();

        if (this.configuration.gameBoardEmbed) {
            builder.withEmbed(this.configuration.embedColor ?? 2719929);
        }

        return builder;
    }

    /**
     * Sends the state and ends game attached to the message.
     *
     * @param winner winner of the game if the game is finished
     * @param interaction interaction to update if action was triggered by it
     * @private
     */
    private async end(winner?: Entity | null, interaction?: ButtonInteraction): Promise<void> {
        if (this.configuration.gameBoardDelete) {
            const builder = this.createBuilder();
            if (this.expired) {
                builder.withExpireMessage();
            } else if (winner !== null) {
                builder.withEndingMessage(winner);
            }
            await this.tunnel.end(builder.toMessageOptions());
        } else {
            if (this.configuration.gameBoardReactions) {
                await this.tunnel.reply?.reactions?.removeAll();
            }
            await this.update(interaction);
        }

        this.manager.endGame(this, winner);
    }

    /**
     * Waits for the current player to select a move with one reaction below the message.
     * @private
     */
    private awaitMove(): void {
        const expireTime = (this.configuration.gameExpireTime ?? 30) * 1000;
        if (!this.tunnel.reply) return;

        const currentEntity = this.getEntity(this.game.currentPlayer)?.id;

        if (this.configuration.gameBoardReactions) {
            this.tunnel.reply
                .awaitReactions({
                    filter: (reaction, user) =>
                        reaction.emoji.name != null &&
                        user.id === currentEntity &&
                        this.game.isMoveValid(GameBoard.reactionToMove(reaction.emoji.name)),
                    max: 1,
                    time: expireTime,
                    errors: ['time']
                })
                .then(this.onEmojiMoveSelected.bind(this))
                .catch(this.onExpire.bind(this));
        } else {
            this.tunnel.reply
                .createMessageComponentCollector({
                    filter: interaction =>
                        interaction.user.id === currentEntity &&
                        this.game.isMoveValid(
                            GameBoard.buttonIdentifierToMove(interaction.customId)
                        ),
                    max: 1,
                    time: expireTime
                })
                .on('collect', this.onButtonMoveSelected.bind(this))
                .on('end', async (_, reason) => {
                    if (reason !== 'limit') {
                        await this.onExpire();
                    }
                });
        }
    }
}
