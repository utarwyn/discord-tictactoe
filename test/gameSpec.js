const expect = require('chai').expect;
const Discord = require("discord.js");
let TicTacToe, game;

describe('Tic-Tac-Toe Game', function(){

    before(function() {
        TicTacToe = require("../tictactoe/Game.js");
        game = new TicTacToe({
            use_custom_bot: true,
            channel: "test",

            randomize_players: false
        });
    });

    it('should init class correctly', function() {
        expect(TicTacToe).to.be.a("function");
        expect(game).to.be.an.instanceOf(TicTacToe);
    });

    it('should verify required options', function() {
        // Without the Discord API...
        const badGameFuncOne = function() {
            new TicTacToe();
        };
        // ... and without the channel!
        const badGameFuncTwo = function() {
            new TicTacToe({
                api_token: "MY_VERY_GOOD_TOKEN"
            });
        };

        expect(badGameFuncOne).to.throw();
        expect(badGameFuncTwo).to.throw();
    });

    it('should get the value of an option', function() {
        expect(game.getOption('channel')).to.be.equals("test");
        expect(game.getOption('messages.welcome')).not.to.be.equals(undefined);
    });

    it('should bind a custom client', function() {
        const fakeClient = new Discord.Client();
        game.bindToClient(fakeClient);

        // Check client ...
        expect(game._client._bot).to.be.a("object");
        // ... and binded events (+2)!
        expect(fakeClient._eventsCount).to.be.equals(3+2);
    });

    it('should register players', function() {
        let fakePlayer1 = {name: "test1"};
        let fakePlayer2 = {name: "test2"};

        game.newPlayer(fakePlayer1);
        game.newPlayer(fakePlayer2);

        expect(game.player1).to.be.equals(fakePlayer1);
        expect(game.player2).to.be.equals(fakePlayer2);
    });

    it('should reset game correctly', function() {
        game.reset();

        // Core game
        expect(game.player1).to.be.equals(null);
        expect(game.player2).to.be.equals(null);
        expect(game.currentPlayerIdx).to.be.equals(0);
        expect(game._resetTask).to.be.equals(null);
        // Game grid
        expect(game._grid._data).to.have.lengthOf(0);
        // Game client
        expect(game._client._gridMessage).to.be.equals(null);
        expect(game._client._playerMessage).to.be.equals(null);
    });

    it('more tests soon!');

});