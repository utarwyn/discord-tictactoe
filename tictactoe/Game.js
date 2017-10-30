const Client = require("./Client.js");
const Grid   = require("./Grid.js");
const Util   = require("./Util.js");

class Game {

    constructor(options) {
        // Merge default options...
        this._options = Util.mergeDeep({
            command : "duel",
            auto_clear : false,

            messages : {
                welcome : "Welcome on Tic-Tac-Toe Discord's game !",
                waiting_opponent : "%player% is ready for a duel!",
                begin_game : "%player1% and %player2% have just begun a game!",
                introduce_round : "It's %player%'s turn (%symbol%) !",
                end_equality : "No winner! So sad! :(",
                end_victory : "%player% win the game! GG! :wink:"
            }
        }, options);

        this.player1 = null;
        this.player2 = null;
        this.currentPlayerIdx = 0;
        this.inProgress = false;

        this._verifyOptions();

        this._client = new Client(this, this._options["api_token"]);
        this._grid = new Grid();
    }

    isGameInProgress() {
        return this.inProgress;
    }

    newPlayer(member) {
        if (this.isMemberRegistered(member))
            return false;

        if (this.player1 === null)
            this.player1 = member;
        else if (this.player2 === null)
            this.player2 = member;
        else
            return false;

        if (this.player1 !== null && this.player2 !== null)
            this.runGame();

        return true;
    }

    getPlayer1() {
        return this.player1;
    }

    getPlayer2() {
        return this.player2;
    }

    isMemberRegistered(member) {
        return this.player1 == member || this.player2 == member;
    }

    getCurrentPlayer() {
        return (this.currentPlayerIdx === 0) ? this.player1 : this.player2;
    }

    getGrid() {
        return this._grid;
    }

    getEmojiFor(player) {
        if (!player)
            return "white_large_square";
        else if (player.user.id === this.player1.user.id)
            return "regional_indicator_x";
        else if (player.user.id === this.player2.user.id)
            return "o2";
        else
            return "poop";
    }

    runGame() {
        let self = this;

        // Randomize players
        if (Math.random() >= 0.5) {
            let tmp = this.player1;
            this.player1 = this.player2;
            this.player2 = tmp;
        }

        this.inProgress = true;

        this._client.clearChannel(function() {
            self._client.sendBeginGame();
            self._client.sendGrid(self._grid, self.getCurrentPlayer());
        });
    }

    newMove(position) {
        // Update grid if move is valid
        if (!this._grid.playerMoveAt(this.getCurrentPlayer(), position))
            return;

        // Next player!
        this.currentPlayerIdx = (this.currentPlayerIdx + 1) % 2;

        // Send the grid for the next round (or not?).
        this._client.sendGrid(this._grid, this.getCurrentPlayer());

        // Check for a winner!
        let winner = this._grid.checkWinner();
        if (winner) {
            this._client.sendEndGame(winner);
            this.inProgress = false;

            setTimeout(() => this.reset(), 10000);
            return;
        }

        // Check for the end of the game!
        if (this._grid.isFull()) {
            this._client.sendEndGame(null);
            this.inProgress = false;

            setTimeout(() => this.reset(), 10000);
        }
    }

    reset() {
        this.player1 = null;
        this.player2 = null;
        this.currentPlayerIdx = 0;

        this._grid.reset();
        this._client.reset();

        this._client.startWaiting();
    }

    getOption(key) {
        let keys = key.split(".");
        let val  = this._options;

        for (let i = 0; i < keys.length; i++)
            val = val[keys[i]];

        return val;
    }

   _verifyOptions() {
        if (this._options["api_token"] === undefined) {
            console.error("(ERR) You have to give the Discord's API Token to start the bot.");
            console.error("(ERR) For more information : http://bit.ly/2z1FsR3");
            process.exit(1);
        }

        if (this._options["channel"] === undefined) {
            console.error("(ERR) You have to give the Discord's channel where the bot will be started.");
            console.error("(ERR) For more information : http://bit.ly/2z1FsR3");
            process.exit(2);
        }
    }

}

module.exports = Game;