const Client = require('./Client');
const Player = require('./Player');
const Grid = require('./Grid');
const Util = require('./util/Util');
const Logger = require('./util/Logger');

class Game {

    /**
     * Used to construct a new Game object.
     * @param options
     */
    constructor(options) {
        // Merge default options...
        this._options = Util.mergeDeep({
            command: "duel",
            auto_clear: false,
            use_custom_bot: false,
            silent: false,

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

        /**
         * The first player
         * @type {null|Player}
         */
        this.player1 = null;

        /**
         * The second player
         * @type {null|Player}
         */
        this.player2 = null;

        this.currentPlayerIdx = 0;

        /**
         * Boolean whiches control the game state.
         * @type {boolean} True if the game is under progress.
         */
        this.inProgress = false;

        /**
         * Contains the task ID which
         * @type {null|int}
         * @private
         */
        this._resetTask = null;

        Logger.setSilent(this._options.silent);
        this._verifyOptions();

        if (!this.getOption("use_custom_bot")) {
            this._client = new Client(this, this._options["api_token"]);
        } else {
            Logger.log('Starting bot with a custom Discord client...');
        }

        this._grid = new Grid();
    }

    /**
     * Allows to know if the game is currently in progress or not.
     * @returns {boolean} True if the game is under progress.
     */
    isGameInProgress() {
        return this.inProgress;
    }

    /**
     * Register a new Discord member for the next game.
     * @param member The Discord Guild Member
     * @returns {boolean} True if the member could be added.
     */
    newMember(member) {
        if (this.isMemberRegistered(member))
            return false;

        if (this.player1 === null)
            this.player1 = new Player(member);
        else if (this.player2 === null)
            this.player2 = new Player(member);
        else
            return false;

        if (this.player1 !== null && this.player2 !== null)
            this.runGame();
        else
        // Re-start the inactivity cooldown.
            this.runInactivityResetTask();

        return true;
    }

    /**
     * Get the first player of the game
     * @returns {null|Player}
     */
    getPlayer1() {
        return this.player1;
    }

    /**
     * Get the second player of the game
     * @returns {null|Player}
     */
    getPlayer2() {
        return this.player2;
    }

    /**
     * Allows to know if a specific Discord member is registered.
     * @param member Discord Guild Member to test.
     * @returns {boolean} True if the passed member is registered for the current game
     */
    isMemberRegistered(member) {
        return (this.player1 !== null && this.player1.isMember(member)) ||
            (this.player2 !== null && this.player2.isMember(member));
    }

    /**
     * Return the current player which have to play.
     * @returns {null|Player}
     */
    getCurrentPlayer() {
        return (this.currentPlayerIdx === 0) ? this.player1 : this.player2;
    }

    /**
     * Get the Grid class (to manage the grid)
     * @returns {Grid}
     */
    getGrid() {
        return this._grid;
    }

    /**
     * Get the specific player's emoji which will be displayed in the grid.
     * @param player {Player} The guild member
     * @returns {string} Emoji formatted in a string.
     */
    getEmojiFor(player) {
        if (!player)
            return "white_large_square";
        else if (player === this.player1)
            return "regional_indicator_x";
        else if (player === this.player2)
            return "o2";
        else
            return "poop";
    }

    /**
     * Start the game.
     */
    runGame() {
        let self = this;

        // Randomize players
        if (this.getOption("randomize_players") && Math.random() >= 0.5) {
            let tmp = this.player1;
            this.player1 = this.player2;
            this.player2 = tmp;
        }

        this.inProgress = true;

        this._client.clearChannel(function () {
            self._client.sendBeginGame();
            self._client.sendGrid(self._grid, self.getCurrentPlayer());

            // Start the inactivity cooldown
            self.runInactivityResetTask();
        });
    }

    /**
     * Run the inactivity task for a automatic reset of the game.
     * (if there is no action in X seconds)
     */
    runInactivityResetTask() {
        let self = this;

        if (this._resetTask) {
            clearTimeout(this._resetTask);
        }

        this._resetTask = setTimeout(function () {
            // Doing this, only if an action was done before.
            if (!self.isGameInProgress() && self.player1 === null && self.player2 === null)
                return;

            self.reset();
            self._client.startWaiting();
        }, 1000 * this.getOption("inactivity_cooldown"));
    }

    /**
     * A player has choosen a place to play in.
     * @param position The position where the member wants to play.
     */
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

            setTimeout(() => {
                this.reset();
                this._client.startWaiting();
            }, 10000);
            return;
        }

        // Check for the end of the game!
        if (this._grid.isFull()) {
            this._client.sendEndGame(null);
            this.inProgress = false;

            setTimeout(() => {
                this.reset();
                this._client.startWaiting();
            }, 10000);
        }
    }

    /**
     * API method used to bind a custom client where the game will be runned.
     * @param bot The client bot used.
     */
    bindToClient(bot) {
        this._client = new Client(this, bot);
    }

    /**
     * Reset all the game (grid, client and all data)
     */
    reset() {
        this.player1 = null;
        this.player2 = null;
        this.currentPlayerIdx = 0;

        clearTimeout(this._resetTask);
        this._resetTask = null;

        this._grid.reset();
        this._client.reset();
    }

    /**
     * Method used to get an option in the config object.
     * @param key The key where the option's value is stored.
     * @returns {null|*} The config value stored or null.
     */
    getOption(key) {
        let keys = key.split(".");
        let val = this._options;

        for (let i = 0; i < keys.length; i++)
            val = val[keys[i]];

        return val;
    }

    /**
     * Private method used to verify if the option object is well formated or not.
     * @private
     */
    _verifyOptions() {
        if (!this._options["api_token"] && !this._options["use_custom_bot"]) {
            Logger.error('Please provide your Discord API token with the key `api_token`.');
            Logger.error('More info to configure the bot at http://bit.ly/2z1FsR3');
            throw Error('Wrong API token!');
        }

        if (!this._options["channel"]) {
            Logger.error('Please provide the channel where you want to run the game with key `channel`.');
            Logger.error('More info to configure the bot at http://bit.ly/2z1FsR3');
            throw Error('Wrong channel name!');
        }
    }

}

module.exports = Game;
