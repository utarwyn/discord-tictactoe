import EventHandler from '@bot/EventHandler';
import TicTacToeBot from '@bot/TicTacToeBot';
import localize from '@i18n/localize';
import { Client, CommandInteraction, Message } from 'discord.js';
import TicTacToe from '../index';

jest.mock('@bot/EventHandler');
jest.mock('@bot/TicTacToeBot');
jest.mock('@i18n/localize');
jest.mock('discord.js');

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

        test('should throw an error if token is not provided at all', async () => {
            Object.assign(tictactoe, { config: { ...tictactoe['config'], token: undefined } });
            await expect(tictactoe.login()).rejects.toBeTruthy();
        });

        test('should throw an error if there is no command provided', async () => {
            Object.assign(tictactoe, { config: { ...tictactoe['config'], command: undefined } });
            await expect(tictactoe.login()).rejects.toBeTruthy();
        });
    });

    test('should call attachToClient from bot', () => {
        const client = { application: { description: 'client' } } as Client;
        tictactoe.attach(client);
        expect(bot.attachToClient).toHaveBeenCalledTimes(1);
        expect(bot.attachToClient).toHaveBeenCalledWith(client);
    });

    test('should call handleMessage from bot', () => {
        const message = { id: 'message' } as Message;
        tictactoe.handleMessage(message);
        expect(bot.handleMessage).toHaveBeenCalledTimes(1);
        expect(bot.handleMessage).toHaveBeenCalledWith(message);
    });

    test('should call handleInteraction from bot', () => {
        const interaction = { id: 'interaction' } as CommandInteraction;
        tictactoe.handleInteraction(interaction);
        expect(bot.handleInteraction).toHaveBeenCalledTimes(1);
        expect(bot.handleInteraction).toHaveBeenCalledWith(interaction);
    });

    test('should call registerListener from event handler', () => {
        const listener = jest.fn();
        tictactoe.on('tie', listener);
        expect(eventHandler.registerListener).toHaveBeenCalledTimes(1);
        expect(eventHandler.registerListener).toHaveBeenCalledWith('tie', listener);
    });
});
