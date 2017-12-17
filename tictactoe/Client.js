const Discord = require("discord.js");

class Client {

    constructor(game, connectionObj) {
        this._game     = game;

        this._channel       = null;
        this._gridMessage   = null;
        this._playerMessage = null;

        this.connect(connectionObj);
    }



    connect(connectionObj) {
        const self = this;
        let isApiToken = typeof connectionObj === "string";

        this._bot = (isApiToken) ? new Discord.Client() : connectionObj;

        // Bot events!
        this._bot.on("ready", self.onReady.bind(self));
        this._bot.on("message", self.onMessage.bind(self));
        this._bot.on("messageReactionAdd", self.onReactionAdd.bind(self));

        // Connecting bot to Discord...
        if (isApiToken)
            this._bot.login(connectionObj).
                then(function() {
                    console.log("Discord bot successfully connected!");
                    console.log("No debug for the moment. Maybe soon?");
                }).
                catch(function(err) {
                    console.error("Catched a Discord API error. Exiting...\n" + err);
                    process.exit(3);
                });
    }


    onReady() {
        this.startWaiting();
    }

    onMessage(message) {
        // Check command validity at the beginning.
        if (message.channel.name !== this._game.getOption("channel"))
            return;

        if (this._game.isGameInProgress() && !message.member.user.bot && !this._game.isMemberRegistered(message.member)) {
            message.delete();
            return;
        }

        if (!message.content.startsWith("!" + this._game.getOption("command")))
            return;

        let args = message.content.split(" ");
        args.shift();

        // With username...
        if (args.length > 0) {
           let user = this.getUserByName(args[0]);

           if (user === null) {
               message.reply("nous ne connaissons pas de joueur nommé **" + args[0] + "**.");
           } else {
                // TODO: not working, use only !duel for the moment.
                user.createDM().then(function(channel) {
                    return channel.send(message.member.displayName + " t'a défié sur le jeu **TicTacToe** sur le serveur d'Utaria ! Viens le battre !\nhttps://discord.gg/scTemzr");
                });
           }
        } else {
            if (!this._game.newPlayer(message.member))
                message.delete();
            else if (!this._game.getPlayer2()) {
                let waitMsg = this._game.getOption("messages.waiting_opponent");
                waitMsg = waitMsg.replace("%player%", "<@" + message.member.user.id + ">");

                message.channel.send(waitMsg).catch(console.error);
            }
        }
    }

    onReactionAdd(message, user) {
        if (!this._game.getCurrentPlayer()) return;

        let currentUser = this._game.getCurrentPlayer().user;
        if (user.bot || user.id !== currentUser.id) return;

        let idx = this._game.getGrid().decodeMove(message.emoji);
        this._game.newMove(idx);
    }


    startWaiting() {
        let channel     = this.getChannel();
        let welcomeMsg  = this._game.getOption("messages.welcome");

        if (this._game.getOption("auto_clear"))
            this.clearChannel();

        if (welcomeMsg !== null)
            channel.send(welcomeMsg);
    }

    sendBeginGame() {
        let msg = this._game.getOption("messages.begin_game");

        msg = msg.replace("%player1%", this._game.getPlayer1().displayName);
        msg = msg.replace("%player2%", this._game.getPlayer2().displayName);

        this.getChannel().send(msg).catch(console.error);
    }

    sendGrid(grid, currentPlayer) {
        let self = this;
        let playerCtn, content = "";

        playerCtn = this._game.getOption("messages.introduce_round");
        playerCtn = playerCtn.replace("%player%", "<@" + currentPlayer.user.id + ">");
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

        this.getChannel().send(playerCtn).
            then(message => {
                self._playerMessage = message;

                self.getChannel().send(content).
                    then(message => {
                        function postEmoji(idx) {
                            if (idx >= grid.getSize()) return;
                            message.react(grid.getReactionEmojiAt(idx)).then(() => postEmoji(idx+1)).catch(console.error);
                        }

                        postEmoji(0);

                        self._gridMessage = message;
                    }
                ).catch(console.error);

            }
        ).catch(console.error);
    }

    sendEndGame(winner) {
        this._playerMessage.delete();
        let winMessage;

        if (!winner)
            winMessage = this._game.getOption("messages.end_equality");
        else {
            winMessage = this._game.getOption("messages.end_victory");
            winMessage = winMessage.replace("%player%", "<@" + winner.user.id + ">");
        }


        this._gridMessage.clearReactions().catch(console.error);
        this.getChannel().send(winMessage).catch(console.error);
    }

    reset() {
        this._gridMessage = null;
        this._playerMessage = null;
    }


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

    getChannel() {
        if (this._channel !== null)
            return this._channel;

        if (this._bot.guilds.array().length === 0)
            return null;

        let channelName = this._game.getOption("channel");
        let channels    = this._bot.guilds.array()[0].channels.array();

        for (let ch of channels)
            if (ch.name === channelName) {
                this._channel = ch;
                return ch;
            }

        return null;
    }

    getUserByName(userName) {
        for (let user of this._bot.users.array())
            if (!user.bot && user.username === userName)
                return user;

        return null;
    }

}

module.exports = Client;