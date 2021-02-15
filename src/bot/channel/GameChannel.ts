import { GuildMember, Message, TextChannel } from 'discord.js';
import GameEntity from '@bot/channel/GameEntity';
import GameBoardMessage from '@bot/gameboard/GameBoardMessage';
import DuelRequestMessage from '@bot/request/DuelRequestMessage';
import TicTacToeBot from '@bot/TicTacToeBot';
import localize from '@config/localize';
import AI from '@tictactoe/AI';

/**
 * Manages a channel in which games can be played.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class GameChannel {
    /**
     * TicTacToe bot.
     */
    private readonly bot: TicTacToeBot;
    /**
     * Discord channel parent object
     */
    private readonly _channel: TextChannel;
    /**
     * Collection with all challenge messages
     */
    private requests: Array<DuelRequestMessage>;
    /**
     * Current board messages for the running game
     */
    private gameBoard?: GameBoardMessage;

    /**
     * Constructs a new game channel managed by the client.
     *
     * @param bot client interaction service
     * @param channel managed Discord channel parent object
     */
    constructor(bot: TicTacToeBot, channel: TextChannel) {
        this.bot = bot;
        this._channel = channel;
        this.requests = [];
    }

    /**
     * Retrieves the Discord parent object for this channel.
     */
    public get channel(): TextChannel {
        return this._channel;
    }

    /**
     * Checks if a game is running in this channel.
     */
    public get gameRunning(): boolean {
        return this.gameBoard !== undefined;
    }

    /**
     * Sends a new duel request managed by the bot.
     *
     * @param original original message sent by the requester
     * @param invited user invited to a duel
     */
    public async sendDuelRequest(original: Message, invited: GuildMember): Promise<void> {
        const expireTime = this.bot.configuration.requestExpireTime;
        const message = new DuelRequestMessage(this, original, invited, expireTime);
        this.requests.push(message);
        await message.send();
    }

    /**
     * Closes a duel request.
     *
     * @param request request object to close, if empty, close all requests
     * @param message message to send after closing
     */
    public async closeDuelRequest(request: DuelRequestMessage, message?: string): Promise<void> {
        await request.close(message);
        this.requests.splice(this.requests.indexOf(request), 1);
    }

    /**
     * Ends the current game and emit game events.
     *
     * @param winner entity who wins the game
     */
    public endGame(winner?: GameEntity): void {
        if (this.gameRunning) {
            if (winner) {
                this.bot.eventHandler.emitEvent('win', {
                    winner,
                    loser: this.gameBoard?.entities.find(entity => entity !== winner)
                });
            } else {
                this.bot.eventHandler.emitEvent('tie', {
                    players: this.gameBoard?.entities
                });
            }
            this.gameBoard = undefined;
        }
    }

    /**
     * Changes the state of the current game to expired.
     * Also allow other games to be played in the channel.
     */
    public async expireGame(): Promise<void> {
        if (this.gameRunning) {
            await this.channel.send(localize.__('game.expire'));
            this.gameBoard = undefined;
        }
    }

    /**
     * Creates a new game in the channel if none running.
     *
     * @param member1 first player object
     * @param member2 second player object, can be empty if player wants to play against a bot
     */
    public async createGame(member1: GuildMember, member2?: GuildMember): Promise<void> {
        // Close all duel requests before
        for (const request of this.requests) {
            await request.close();
        }
        this.requests = [];

        // If no game is running, create a new one with two members
        if (!this.gameRunning) {
            this.gameBoard = new GameBoardMessage(
                this,
                member1,
                member2 ?? new AI(),
                this.bot.configuration
            );
            await this.gameBoard.update();
            if (this.gameRunning) {
                await this.gameBoard.attemptNextTurn();
            }
        }
    }
}
