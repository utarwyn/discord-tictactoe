const Client = require("./Client.js");
const Grid   = require("./Grid.js");
const Util   = require("./Util.js");

class Game {

    constructor(options) {
        // Merge default options...
        this._options = Util.mergeDeep({
            command: "duel",
            auto_clear: false,
            use_custom_bot: false,

            randomize_players: true,
            inactivity_cooldown: 600, // in seconds

            messages: {
                welcome: "Welcome on Tic-Tac-Toe Discord's game !",
                waiting_opponent: "%player% is ready for a duel!",
                begin_game: "%player1% and %player2% have just begun a game!",
                introduce_round: "It's %player%'s turn (%symbol%) !",
                end_equality: "No winner! So sad! :(",
                end_victory: "%player% win the game! GG! :wink:"
            }
        }, options);

        this.player1 = null;
        this.player2 = null;
        this.currentPlayerIdx = 0;
        this.inProgress = false;
        this._resetTask = null;

        this._verifyOptions();

        if (!this.getOption("use_custom_bot")) {
            this._client = new Client(this, this._options["api_token"]);
        } else
            console.log("(INFO) You use a custom Discord Bot.");

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
        else
            // Re-start the inactivity cooldown.
            this.runInactivityResetTask();

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
        if (this.getOption("randomize_players") && Math.random() >= 0.5) {
            let tmp = this.player1;
            this.player1 = this.player2;
            this.player2 = tmp;
        }

        this.inProgress = true;

        this._client.clearChannel(function() {
            self._client.sendBeginGame();
            self._client.sendGrid(self._grid, self.getCurrentPlayer());

            // Start the inactivity cooldown
            self.runInactivityResetTask();
        });
    }

    runInactivityResetTask() {
        let self = this;

        if (this._resetTask !== null)
            clearTimeout(this._resetTask);

        this._resetTask = setTimeout(function() {
            // Doing this, only if an action was done before.
            if (!self.isGameInProgress() && self.player1 === null && self.player2 === null)
                return;

            self.reset();
            self._client.startWaiting();
        }, 1000 * this.getOption("inactivity_cooldown"));
    }

    newMove(position) {
        // Update grid if move is valid
        if (!this._grid.playerMoveAt(this.getCurrentPlayer(), position))
            return;

        // Next player!
        this.currentPlayerIdx = (this.currentPlayerIdx + 1) % 2;

        // Send the grid for the next round (or not?).
        this._client.sendGrid(this._grid, this.getCurrentPlayer());

        // Re-start the inactivity cooldown.
        this.runInactivityResetTask();

        // Check for a winner!
        let winner = this._grid.checkWinner();
        if (winner) {
            this._client.sendEndGame(winner);
            this.inProgress = false;

            setTimeout(() => { this.reset(); this._client.startWaiting(); }, 10000);
            return;
        }

        // Check for the end of the game!
        if (this._grid.isFull()) {
            this._client.sendEndGame(null);
            this.inProgress = false;

            setTimeout(() => { this.reset(); this._client.startWaiting(); }, 10000);
        }
    }

    reset() {
        this.player1 = null;
        this.player2 = null;
        this.currentPlayerIdx = 0;

        clearTimeout(this._resetTask);
        this._resetTask = null;

        this._grid.reset();
        this._client.reset();
    }

    getOption(key) {
        let keys = key.split(".");
        let val  = this._options;

        for (let i = 0; i < keys.length; i++)
            val = val[keys[i]];

        return val;
    }

   _verifyOptions() {
        if (this._options["api_token"] === undefined && !this._options["use_custom_bot"])
            throw new ReferenceError("You have to give the Discord's API Token to start the bot. For more information, please visit http://bit.ly/2z1FsR3");

        if (this._options["channel"] === undefined)
            throw new ReferenceError("You have to give the Discord's channel where the bot will be started. For more information, please visit http://bit.ly/2z1FsR3");
    }

   bindToClient(bot) {
       this._client = new Client(this, bot);
   }

}

module.exports = Game;