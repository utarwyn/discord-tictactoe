const expect = require('chai').expect;
const Discord = require('discord.js');
let TicTacToe, game;

describe('Tic-Tac-Toe AI', function () {

    before(function () {
        TicTacToe = require("../src/Game.js");
        game = new TicTacToe({
            use_custom_bot: true,
            channel: "test",

            randomize_players: false
        });
    });

    // it('tests soon!');

});
