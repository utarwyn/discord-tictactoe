const chalk = require('chalk');

class Logger {

    constructor() {
        this._prefix = chalk.blue('TicTacToe Bot | ');
        this._silent = false;
    }

    setSilent(silent) {
        this._silent = silent;
    }

    log(message) {
        if (!this._silent) {
            console.log(this._prefix + message);
        }
    }

    success(message) {
        if (!this._silent) {
            console.log(this._prefix + chalk.green(message));
        }
    }

    error(message) {
        console.log(this._prefix + chalk.red(message));
    }

}

module.exports = new Logger();
