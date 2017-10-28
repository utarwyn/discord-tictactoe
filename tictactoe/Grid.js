class Grid {

    constructor() {
        this._size = 3;
        this._data = [];

        this.initReactions();
    }

    getLineLength() {
        return this._size;
    }

    getSize() {
        return this._size * this._size;
    }

    getPlayerAt(index) {
        return this._data[index];
    }

    isFull() {
        for (let i = 0; i < this.getSize(); i++)
            if (!this._data[i])
                return false;

        return true;
    }

    playerMoveAt(player, index) {
        if (!this._data[index]) {
            this._data[index] = player;
            return true;
        } else
            return false;
    }

    decodeMove(emojiReact) {
        for (let i = 0; i < this._reactDict.length; i++)
            if (this._reactDict[i] == emojiReact)
                return i;

        return -1;
    }

    checkWinner() {
        // Check horizontally
        for (let row = 0; row < this.getLineLength(); row++) {
            let idx1 = this.rowColToIdx(row, 0);
            let idx2 = this.rowColToIdx(row, 1);
            let idx3 = this.rowColToIdx(row, 2);

            if (this.compare(idx1, idx2) && this.compare(idx2, idx3))
                return this.getPlayerAt(idx1);
        }

        // Check vertically
        for (let col = 0; col < this.getLineLength(); col++) {
            let idx1 = this.rowColToIdx(0, col);
            let idx2 = this.rowColToIdx(1, col);
            let idx3 = this.rowColToIdx(2, col);

            if (this.compare(idx1, idx2) && this.compare(idx2, idx3))
                return this.getPlayerAt(idx1);
        }

        // Check diagonals
        let middleIdx = this.rowColToIdx(1, 1);
        let diag1idx1 = this.rowColToIdx(0, 0);
        let diag1idx3 = this.rowColToIdx(2, 2);

        if (this.compare(diag1idx1, middleIdx) && this.compare(middleIdx, diag1idx3))
            return this.getPlayerAt(diag1idx1);

        let diag2idx1 = this.rowColToIdx(0, 2);
        let diag2idx3 = this.rowColToIdx(2, 0);

        if (this.compare(diag2idx1, middleIdx) && this.compare(middleIdx, diag2idx3))
            return this.getPlayerAt(diag2idx1);
    }

    rowColToIdx(row, col) {
        return row * this.getLineLength() + col;
    }

    compare(idx1, idx2) {
        return this._data[idx1] && this._data[idx2] && this._data[idx1].user.id === this._data[idx2].user.id;
    }

    getReactionEmojiAt(idx) {
        return this._reactDict[idx];
    }

    reset() {
        this._data = [];
    }

    initReactions() {
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