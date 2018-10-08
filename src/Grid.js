class Grid {

    /**
     * Used to construct the Grid object.
     */
    constructor() {
        /**
         * The width|height of the grid.
         * @type {number}
         * @private
         */
        this._size = 3;

        /**
         * Data stored in the grid.
         * @type {Array}
         * @private
         */
        this._data = [];

        this._initReactions();
    }

    /**
     * Returns the line length of the grid.
     * (width fo the grid if your prefer)
     * @returns {number}
     */
    getLineLength() {
        return this._size;
    }

    /**
     * Get the size of the grid (the number of boxes)
     * @returns {number}
     */
    getSize() {
        return this._size * this._size;
    }

    /**
     * Method which returns the player which has played at a specific position.
     * @param index The position where you want to retrive the player.
     * @returns {null|Player} The Discord guild member (player).
     */
    getPlayerAt(index) {
        return this._data[index];
    }

    /**
     * Check if the grid is full or not.
     * @returns {boolean} True if the grid is full.
     */
    isFull() {
        for (let i = 0; i < this.getSize(); i++)
            if (!this._data[i])
                return false;

        return true;
    }

    /**
     * Method used when a player plays at a specific position.
     * @param player {Player} The player who have played.
     * @param index {int} Where the player have played.
     * @returns {boolean} True if the move is correct.
     */
    playerMoveAt(player, index) {
        if (!this._data[index]) {
            this._data[index] = player;
            return true;
        } else
            return false;
    }

    /**
     * This method decodes an emoji to return the position of the box pointed by the emoji.
     * @param emojiReact The unicode emoji.
     * @returns {number} The calculated position (or -1 if emoji was not recognized).
     */
    decodeMove(emojiReact) {
        for (let i = 0; i < this._reactDict.length; i++)
            if (this._reactDict[i] === emojiReact)
                return i;

        return -1;
    }

    /**
     * Check if there is a winner in the grid.
     * @returns {null|Player} The winner (or null if there is no winner at the moment).
     */
    checkWinner() {
        // Check horizontally
        for (let row = 0; row < this.getLineLength(); row++) {
            let idx1 = this._rowColToIdx(row, 0);
            let idx2 = this._rowColToIdx(row, 1);
            let idx3 = this._rowColToIdx(row, 2);

            if (this._compare(idx1, idx2) && this._compare(idx2, idx3))
                return this.getPlayerAt(idx1);
        }

        // Check vertically
        for (let col = 0; col < this.getLineLength(); col++) {
            let idx1 = this._rowColToIdx(0, col);
            let idx2 = this._rowColToIdx(1, col);
            let idx3 = this._rowColToIdx(2, col);

            if (this._compare(idx1, idx2) && this._compare(idx2, idx3))
                return this.getPlayerAt(idx1);
        }

        // Check diagonals
        let middleIdx = this._rowColToIdx(1, 1);
        let diag1idx1 = this._rowColToIdx(0, 0);
        let diag1idx3 = this._rowColToIdx(2, 2);

        if (this._compare(diag1idx1, middleIdx) && this._compare(middleIdx, diag1idx3))
            return this.getPlayerAt(diag1idx1);

        let diag2idx1 = this._rowColToIdx(0, 2);
        let diag2idx3 = this._rowColToIdx(2, 0);

        if (this._compare(diag2idx1, middleIdx) && this._compare(middleIdx, diag2idx3))
            return this.getPlayerAt(diag2idx1);
    }

    /**
     * This method returns the emoji for a given position.
     * @param idx Index of the position.
     * @returns {string} The emoji (unicode).
     */
    getReactionEmojiAt(idx) {
        return this._reactDict[idx];
    }

    /**
     * Method used to reset the grid.
     */
    reset() {
        this._data = [];
    }

    /**
     * Private method used to transform an row-col position to an index position.
     * @param row {int} The row's position
     * @param col {int} The col's position
     * @returns {int} The index of the position.
     * @private
     */
    _rowColToIdx(row, col) {
        return row * this.getLineLength() + col;
    }

    /**
     * Compare boxes at two given indexes.
     * @param idx1 {int} The first index.
     * @param idx2 {int} The second index.
     * @returns {boolean} True if the data of boxes is equal.
     * @private
     */
    _compare(idx1, idx2) {
        return this._data[idx1] && this._data[idx2] && this._data[idx1].equals(this._data[idx2]);
    }

    /**
     * Method used to initialize the reactions' dictionary.
     * @private
     */
    _initReactions() {
        this._reactDict = [
            "\u2196", // Top left
            "\u2B06", // Top
            "\u2197", // Top right
            "\u2B05", // Left
            "\u23FA", // Middle
            "\u27A1", // Right
            "\u2199", // Bottom left
            "\u2B07", // Bottom
            "\u2198"  // Bottom right
        ];
    }
}

module.exports = Grid;
