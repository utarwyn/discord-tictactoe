const expect = require('chai').expect;
const Discord = require('discord.js');

let TicTacToe, game;

describe('Tic-Tac-Toe Game', function () {

    before(function () {
        TicTacToe = require('../src/Game');

        game = new TicTacToe({
            use_custom_bot: true,
            silent: true,
            channel: "test",

            randomize_players: false
        });
    });

    it('should init class correctly', function () {
        expect(TicTacToe).to.be.a('function');
        expect(game).to.be.an.instanceOf(TicTacToe);
    });

    it('should verify required options', function () {
        // Without the Api token ...
        const badGameFuncOne = function () {
            new TicTacToe();
        };
        // ... or without the channel!
        const badGameFuncTwo = function () {
            new TicTacToe({
                api_token: 'MY_AWESOME_TOKEN'
            });
        };

        expect(badGameFuncOne).to.throw();
        expect(badGameFuncTwo).to.throw();
    });

    it('should check bad connection', done => {
        const game = new TicTacToe({
            api_token: 'bad_api_token',
            channel: 'awesome'
        });

        // TODO
        done()
    });

    it('should get the value of an option', function () {
        expect(game.getOption('channel')).to.be.equals('test');
        expect(game.getOption('messages.welcome')).not.to.be.equals(undefined);
    });

    it('should bind a custom client', function () {
        const fakeClient = new Discord.Client();
        game.bindToClient(fakeClient);

        // Check client ...
        expect(game._client._bot).to.be.a('object');
        // ... and binded events (+2)!
        expect(fakeClient._eventsCount).to.be.equals(3 + 2);
    });

    it('should register players', function () {
        let fakePlayer1 = { displayName: 'test1' };
        let fakePlayer2 = { displayName: 'test2' };

        game.newMember(fakePlayer1);
        game.newMember(fakePlayer2);

        expect(game.player1.getName()).to.be.equals(fakePlayer1.displayName);
        expect(game.player2.getName()).to.be.equals(fakePlayer2.displayName);
    });

    it('should reset game correctly', function () {
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

    // it('more tests soon!');

});
