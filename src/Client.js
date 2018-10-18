const Discord = require('discord.js');
const Logger = require('./util/Logger');

class Client {

    /**
     * Used to construct a new Client object.
     * @param game The class Game where this client will be linked.
     * @param connectionObj The connection object (Bot) where this client will be connected.
     */
    constructor (game, connectionObj) {
        this._game = game;

        this._channel = null;
        this._gridMessage = null;
        this._playerMessage = null;

        this.connect(connectionObj);
    }

    /***
     * Connect this client to a specific Discord Bot Client)
     * @param connectionObj Connect to this existing Discord Client if parameter provided
     */
    connect (connectionObj) {
        const self = this;
        let isApiToken = typeof connectionObj === "string";

        this._bot = (isApiToken) ? new Discord.Client() : connectionObj;

        // Bot events!
        this._bot.on("ready", self.onReady.bind(self));
        this._bot.on("message", self.onMessage.bind(self));
        this._bot.on("messageReactionAdd", self.onReactionAdd.bind(self));

        // Connecting bot to Discord...
        if (isApiToken) {
            this._bot.login(connectionObj).then(() => {
                const guild = this._bot.guilds.first();
                Logger.success(this._bot.user.username + ' successfully connected to ' + guild.name + '!');
            }).catch(err => {
                Logger.error('An error occurred when trying to connect to the Discord server!');
                Logger.error(err);
            });
        }
    }

    /**
     * Method called when the client is ready for usage.
     */
    onReady() {
        const guildName = this._bot.guilds.first().name;
        const channelName = this._game.getOption('channel');

        // Check if the channel exists!
        if (this.getChannel() != null) {
            this.startWaiting();
            Logger.success('Connected to ' + guildName + ' (#' + channelName + ')!');
        } else {
            Logger.error('Cannot find the channel \'' + channelName + '\' on ' + guildName + '.');
            process.exit(1);
        }
    }

    /**
     * Method called when a member emits a message in one channel of the Discord guild.
     * @param message The message sent by the member.
     */
    onMessage(message) {
        // Check command validity at the beginning.
        if (message.channel.name !== this._game.getOption('channel'))
            return;

        if (this._game.isGameInProgress() && !message.member.user.bot && !this._game.isMemberRegistered(message.member)) {
            message.delete();
            return;
        }

        if (message.content.startsWith('!solo')) {
            // TODO!
            return;
        }

        if (!message.content.startsWith('!' + this._game.getOption('command')))
            return;

        let args = message.content.split(' ');
        args.shift();

        if (args.length === 0) {
            if (!this._game.newMember(message.member)) {
                message.delete();
            } else if (!this._game.getPlayer2()) {
                let waitMsg = this._game.getOption("messages.waiting_opponent");
                waitMsg = waitMsg.replace("%player%", "<@" + message.member.user.id + ">");

                message.channel.send(waitMsg).catch(console.error);
            }
        }
    }

    /**
     * Method called when a member use a reaction on a message of the Discord guild.
     * @param message The message where the reaction has been added.
     * @param user The user at the origin of the action.
     */
    onReactionAdd(message, user) {
        let currentPlayer = this._game.getCurrentPlayer();
        if (!currentPlayer) return;

        if (user.bot || !currentPlayer.isMember(user)) return;

        let idx = this._game.getGrid().decodeMove(message.emoji);
        this._game.newMove(idx);
    }

    /**
     * Tell the client to start waiting for players for a new game.
     */
    startWaiting() {
        let channel = this.getChannel();
        let welcomeMsg = this._game.getOption("messages.welcome");

        if (this._game.getOption("auto_clear"))
            this.clearChannel();

        if (welcomeMsg !== null)
            channel.send(welcomeMsg);
    }

    /**
     * Send the beginning of a game (send the game header)
     */
    sendBeginGame() {
        let msg = this._game.getOption("messages.begin_game");

        msg = msg.replace("%player1%", this._game.getPlayer1().getName());
        msg = msg.replace("%player2%", this._game.getPlayer2().getName());

        this.getChannel().send(msg).catch(console.error);
    }

    /**
     * Send (or update) the grid on the channel with grid data.
     * @param grid The grid used to collect the displayed data.
     * @param currentPlayer {Player} The current player.
     */
    sendGrid(grid, currentPlayer) {
        let self = this;
        let playerCtn, content = "";

        playerCtn = this._game.getOption("messages.introduce_round");
        playerCtn = playerCtn.replace("%player%", currentPlayer.getTag());
        playerCtn = playerCtn.replace("%symbol%", ":" + this._game.getEmojiFor(currentPlayer) + ":");

        for (let i = 0; i < grid.getSize(); i++) {
            content += ":" + this._game.getEmojiFor(grid.getPlayerAt(i)) + ":";

            if ((i + 1) % grid.getLineLength() === 0)
                content += "\n";
        }


        if (this._gridMessage !== null) {
            this._playerMessage.edit(playerCtn);
            this._gridMessage.edit(content);
            return;
        }

        this.getChannel().send(playerCtn).then(message => {
                self._playerMessage = message;

                self.getChannel().send(content).then(message => {
                        function postEmoji(idx) {
                            if (idx >= grid.getSize()) return;
                            message.react(grid.getReactionEmojiAt(idx)).then(() => postEmoji(idx + 1)).catch(console.error);
                        }

                        postEmoji(0);

                        self._gridMessage = message;
                    }
                ).catch(console.error);

            }
        ).catch(console.error);
    }

    /**
     * Send the end game message in the defined channel, nothing else.
     * (yes, we also clear the reactions on the grid message)
     * @param winner {Player} The member which has won the game.
     */
    sendEndGame(winner) {
        this._playerMessage.delete();
        let winMessage;

        if (!winner) {
            winMessage = this._game.getOption("messages.end_equality");
        } else {
            winMessage = this._game.getOption("messages.end_victory");
            winMessage = winMessage.replace("%player%", winner.getTag());
        }

        this._gridMessage.clearReactions().catch(console.error);
        this.getChannel().send(winMessage).catch(console.error);
    }

    /**
     * Called to reset the Client.
     */
    reset() {
        this._gridMessage = null;
        this._playerMessage = null;
    }

    /**
     * Used to clear the channel where the current Client is configured.
     * @param callback The callback called when the clear has been done.
     */
    clearChannel(callback = null) {
        let channel = this.getChannel();
        if (channel === null) return;

        channel.fetchMessages()
            .then(messages => {
                messages.deleteAll();

                if (callback !== null)
                    callback();
            })
            .catch(console.error);
    }

    /**
     * Get the channel where this Client is configured.
     * @returns {null|TextChannel}
     */
    getChannel() {
        if (this._channel !== null)
            return this._channel;

        if (this._bot.guilds.array().length === 0)
            return null;

        let channelName = this._game.getOption("channel");
        let channels = this._bot.guilds.first().channels.array();

        for (let ch of channels) {
            if (ch.type === 'text' && ch.name === channelName) {
                return this._channel = ch;
            }
        }

        return null;
    }

}

module.exports = Client;
