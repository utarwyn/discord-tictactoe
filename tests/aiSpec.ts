let TicTacToe, game;

describe('Tic-Tac-Toe AI', function () {
    beforeEach(function () {
        TicTacToe = require('../src/Game.js');
        game = new TicTacToe({
            use_custom_bot: true,
            channel: 'test',
            randomize_players: false,
        });
    });
});
