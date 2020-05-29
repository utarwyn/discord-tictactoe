import Discord from 'discord.js';

let TicTacToe, game;

describe('Tic-Tac-Toe Game', function () {
    beforeEach(function () {
        TicTacToe = require('../src/Game');

        game = new TicTacToe({
            use_custom_bot: true,
            silent: true,
            channel: 'test',
            randomize_players: false,
        });
    });

    it('should init class correctly', function () {
        expect(TicTacToe).toBeInstanceOf(Function);
        expect(game).toBeInstanceOf(TicTacToe);
    });

    it('should verify required options', function () {
        // Without the Api token ...
        const badGameFuncOne = function () {
            new TicTacToe();
        };
        // ... or without the channel!
        const badGameFuncTwo = function () {
            new TicTacToe({
                api_token: 'MY_AWESOME_TOKEN',
            });
        };

        expect(badGameFuncOne).toThrowError();
        expect(badGameFuncTwo).toThrowError();
    });

    it('should check bad connection', (done) => {
        new TicTacToe({
            api_token: 'bad_api_token',
            channel: 'awesome',
        });
        done();
    });

    it('should get the value of an option', function () {
        expect(game.getOption('channel')).toBe('test');
        expect(game.getOption('messages.welcome')).not.toBeUndefined();
    });

    it('should bind a custom client', function () {
        const fakeClient = new Discord.Client();
        game.bindToClient(fakeClient);

        expect(game._client._bot).toBeInstanceOf(Object);
        expect(fakeClient.eventNames().length).toBe(3 + 2);
    });

    it('should register players', function () {
        let fakePlayer1 = { displayName: 'test1' };
        let fakePlayer2 = { displayName: 'test2' };

        game.newMember(fakePlayer1);
        game.newMember(fakePlayer2);

        expect(game.player1.getName()).toBe(fakePlayer1.displayName);
        expect(game.player2.getName()).toBe(fakePlayer2.displayName);
    });

    it('should reset game correctly', function () {
        game.reset();

        // Core game
        expect(game.player1).toBeNull();
        expect(game.player2).toBeNull();
        expect(game.currentPlayerIdx).toBe(0);
        expect(game._resetTask).toBeNull();

        // Game grid
        expect(game._grid._data).toHaveLength(0);

        // Game client
        expect(game._client._gridMessage).toBeNull();
        expect(game._client._playerMessage).toBeNull();
    });
});
