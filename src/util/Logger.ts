import Chalk from 'chalk';

export default class Logger {
    private readonly prefix: string;

    private readonly silent: boolean;

    constructor(silent: boolean) {
        this.prefix = Chalk.blue('TicTacToe Bot | ');
        this.silent = silent;
    }

    log(message) {
        if (!this.silent) {
            console.log(this.prefix + message);
        }
    }

    success(message) {
        if (!this.silent) {
            console.log(this.prefix + Chalk.green(message));
        }
    }

    error(message) {
        console.log(this.prefix + Chalk.red(message));
    }
}
