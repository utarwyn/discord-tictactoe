import EventHandler from '@bot/EventHandler';
import TicTacToeBot from '@bot/TicTacToeBot';
import localize from '@i18n/localize';
import { ChatInputCommandInteraction, Client, GatewayIntentBits, Message } from 'discord.js';
import TicTacToe from '../index';

jest.mock('@bot/EventHandler');
jest.mock('@bot/TicTacToeBot');
jest.mock('@i18n/localize');
jest.mock('discord.js', () => ({
    ...jest.createMockFromModule<any>('discord.js'),
    GatewayIntentBits: jest.requireActual('discord.js').GatewayIntentBits
}));

describe('TicTacToe', () => {
    let bot: TicTacToeBot;
    let eventHandler: EventHandler;
    let tictactoe: TicTacToe;

    beforeEach(() => {
        bot = {
            attachToClient: jest.fn() as any,
            handleMessage: jest.fn() as any,
            handleInteraction: jest.fn() as any
        } as TicTacToeBot;
        eventHandler = { registerListener: jest.fn() as any } as EventHandler;
        tictactoe = new TicTacToe({ command: 'cmd', language: 'fr', token: 'token' });

        jest.mocked(TicTacToeBot).mockImplementation(() => bot);
        jest.mocked(EventHandler).mockImplementation(() => eventHandler);
    });

    test('should use an empty object if config not provided', () => {
        expect(new TicTacToe()['config']).toEqual({});
    });

    test('should load language', () => {
        expect(localize.loadFromLocale).toHaveBeenCalledTimes(1);
        expect(localize.loadFromLocale).toHaveBeenCalledWith('fr');
    });

    describe('Login', () => {
        let client: Client;

        beforeEach(() => {
            client = { login: jest.fn() as any } as Client;
            jest.mocked(Client).mockImplementation(() => client);
        });

        test('should use token from parameter if provided', async () => {
            await tictactoe.login('custom_token');
            expect(client.login).toHaveBeenCalledTimes(1);
            expect(client.login).toHaveBeenCalledWith('custom_token');
        });

        test('should use token from config if parameter is not provided', async () => {
            await tictactoe.login();
            expect(client.login).toHaveBeenCalledTimes(1);
            expect(client.login).toHaveBeenCalledWith('token');
        });

        test('should attach client to bot', async () => {
            await tictactoe.login();
            expect(bot.attachToClient).toHaveBeenCalledTimes(1);
            expect(bot.attachToClient).toHaveBeenCalledWith(client);
        });

        test('should add message content intent if text command is enabled', async () => {
            Object.assign(tictactoe, { config: { ...tictactoe['config'], textCommand: 'ttt' } });
            await tictactoe.login();
            expect(jest.mocked(Client)).toHaveBeenCalledWith({
                intents: expect.arrayContaining([GatewayIntentBits.MessageContent])
            });
        });

        test('should throw an error if token is not provided at all', async () => {
            Object.assign(tictactoe, { config: { ...tictactoe['config'], token: undefined } });
            await expect(tictactoe.login()).rejects.toBeTruthy();
        });

        test('should throw an error if there is no command provided', async () => {
            Object.assign(tictactoe, { config: { ...tictactoe['config'], command: undefined } });
            await expect(tictactoe.login()).rejects.toBeTruthy();
        });

        test('should throw a specific error if a privileged intent is needed', async () => {
            jest.spyOn(client, 'login').mockRejectedValue(new Error('Privileged intent needed'));
            await expect(tictactoe.login()).rejects.toHaveProperty(
                'message',
                expect.stringContaining('enable Message Content')
            );
        });

        test('should throw a generic error if a problem occured during login', async () => {
            const error = new Error('generic error');
            jest.spyOn(client, 'login').mockRejectedValue(error);
            await expect(tictactoe.login()).rejects.toEqual(error);
        });
    });

    test('should call attachToClient from bot', () => {
        const client = { application: { description: 'client' } } as Client;
        tictactoe.attach(client);
        expect(bot.attachToClient).toHaveBeenCalledTimes(1);
        expect(bot.attachToClient).toHaveBeenCalledWith(client);
    });

    test('should call handleMessage from bot', async () => {
        const message = { id: 'message' } as Message;
        await tictactoe.handleMessage(message);
        expect(bot.handleMessage).toHaveBeenCalledTimes(1);
        expect(bot.handleMessage).toHaveBeenCalledWith(message);
    });

    test('should call handleInteraction from bot', async () => {
        const interaction = { id: 'interaction' } as ChatInputCommandInteraction;
        await tictactoe.handleInteraction(interaction);
        expect(bot.handleInteraction).toHaveBeenCalledTimes(1);
        expect(bot.handleInteraction).toHaveBeenCalledWith(interaction);
    });

    test('should call registerListener from event handler', () => {
        const listener = jest.fn();
        tictactoe.on('tie', listener);
        expect(eventHandler.registerListener).toHaveBeenCalledTimes(1);
        expect(eventHandler.registerListener).toHaveBeenCalledWith('tie', listener);
    });

    test('should call addProvider from localize', () => {
        const messageProvider = () => 'my message';
        tictactoe.addMessageProvider('game.load', messageProvider);
        expect(localize.addProvider).toHaveBeenCalledTimes(1);
        expect(localize.addProvider).toHaveBeenCalledWith('game.load', messageProvider);
    });
});
