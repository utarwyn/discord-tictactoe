import { EmbedColor } from '@config/types';
import localize from '@i18n/localize';
import AI from '@tictactoe/ai/AI';
import Entity from '@tictactoe/Entity';
import { Player } from '@tictactoe/Player';
import { APIEmbed, MessageCreateOptions, resolveColor } from 'discord.js';

/**
 * Builds representation of a game board using text emojis
 * whiches will be displayed in a Discord message.
 *
 * @author Utarwyn
 * @since 2.1.0
 */
export default class GameBoardBuilder {
    /**
     * Unicode reactions available for moves.
     */
    public static readonly MOVE_REACTIONS = ['↖️', '⬆️', '↗️', '⬅️', '⏺️', '➡️', '↙️', '⬇️', '↘️'];
    /**
     * Unicode emojis used for representing the two players.
     * @protected
     */
    protected emojies = ['⬜', '🇽', '🅾️'];
    /**
     * Stores game board title message.
     * @protected
     */
    protected title: string;
    /**
     * Stores localization key of current game state.
     * @protected
     */
    protected stateKey: string;
    /**
     * Stores entity whiches is concerned in the state message.
     * @protected
     */
    protected stateEntity?: { name: string; emojiIndex?: number };
    /**
     * Stores game board size.
     * @protected
     */
    protected boardSize: number;
    /**
     * Stores game board data.
     * @protected
     */
    protected boardData: Player[];
    /**
     * Stores embed color if enabled, undefined otherwise.
     * @private
     */
    protected embedColor?: EmbedColor;

    /**
     * Constructs a new game board builder.
     */
    constructor() {
        this.title = '';
        this.stateKey = '';
        this.boardSize = 0;
        this.boardData = [];
    }

    /**
     * Writes a title to the game board message.
     *
     * @param player1 first entity to play
     * @param player2 second entity to play
     * @returns same instance
     */
    public withTitle(player1: Entity, player2: Entity): this {
        this.title =
            localize.__('game.title', {
                player1: player1.displayName,
                player2: player2.displayName
            }) + '\n\n';
        return this;
    }

    /**
     * Configures emojies used for representing both entities.
     *
     * @param first emoji of the first entity
     * @param second emoji of the second entity
     * @param none emoji used for an empty cell
     * @returns same instance
     */
    public withEmojies(first: string, second: string, none?: string): this {
        this.emojies = [none ?? this.emojies[0], first, second];
        return this;
    }

    /**
     * Writes representation of a game board.
     *
     * @param boardSize size of the board
     * @param board game board data
     * @returns same instance
     */
    public withBoard(boardSize: number, board: Player[]): this {
        this.boardSize = boardSize;
        this.boardData = board;
        return this;
    }

    /**
     * Writes that the game is loading.
     *
     * @returns same instance
     */
    public withLoadingMessage(): this {
        this.stateKey = 'game.load';
        return this;
    }

    /**
     * Writes that an entity is playing.
     *
     * @param entity entity whiches is playing.
     * @param emojiIndex index of the emoji to display next to entity name
     * @returns same instance
     */
    public withEntityPlaying(entity: Entity, emojiIndex?: number): this {
        this.stateEntity = { name: entity.toString(), emojiIndex: emojiIndex };
        this.stateKey = entity instanceof AI ? 'game.waiting-ai' : 'game.action';
        return this;
    }

    /**
     * Writes ending state of a game.
     *
     * @param winner winning entity. If undefined: display tie message
     * @returns same instance
     */
    public withEndingMessage(winner?: Entity): this {
        if (winner) {
            this.stateKey = 'game.win';
            this.stateEntity = { name: winner.toString() };
        } else {
            this.stateKey = 'game.end';
        }
        return this;
    }

    /**
     * Writes expiration state of the game.
     *
     * @returns same instance
     */
    public withExpireMessage(): this {
        this.stateKey = 'game.expire';
        return this;
    }

    /**
     * Should use an embed to display the game board.
     *
     * @param embedColor color of the embed
     * @returns same instance
     */
    public withEmbed(embedColor: EmbedColor): this {
        this.embedColor = embedColor;
        return this;
    }

    /**
     * Constructs final representation of the game board.
     *
     * @returns message options of the gameboard
     */
    public toMessageOptions(): MessageCreateOptions {
        // Generate string representation of the board
        let board = '';

        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            board += this.emojies[this.boardData[i]] + ' ';
            if ((i + 1) % this.boardSize === 0) {
                board += '\n';
            }
        }

        const state = this.generateState();
        const stateWithBoard = `${board}${board && state ? '\n' : ''}${state}`;

        // Use an embed if enabled
        let embed: APIEmbed | null = null;
        if (this.embedColor) {
            embed = {
                title: this.title,
                description: stateWithBoard,
                color: resolveColor(this.embedColor)
            };
        }
        return {
            allowedMentions: { parse: ['users'] },
            embeds: embed !== null ? [embed] : [],
            content: embed === null ? this.title + stateWithBoard : undefined,
            components: []
        };
    }

    protected generateState(): string {
        let player = this.stateEntity?.name;
        if (this.stateEntity?.emojiIndex !== undefined) {
            player += ` ${this.emojies[this.stateEntity.emojiIndex]}`;
        }
        return localize.__(this.stateKey, player ? { player } : undefined);
    }
}
