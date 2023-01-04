import AppCommandRegister from '@bot/command/AppCommandRegister';
import GameCommand from '@bot/command/GameCommand';
import EventHandler from '@bot/EventHandler';
import TicTacToeBot from '@bot/TicTacToeBot';
import Config from '@config/Config';
import { Client, CommandInteraction, Message } from 'discord.js';

jest.mock('@bot/command/AppCommandRegister');
jest.mock('@bot/command/GameCommand');
jest.mock('@bot/state/GameStateManager');

describe('TicTacToeBot', () => {
    let configuration: Config;
    let eventHandler: EventHandler;
    let gameCommand: GameCommand;
    let bot: TicTacToeBot;

    beforeEach(() => {
        configuration = {} as Config;
        eventHandler = {} as EventHandler;
        gameCommand = {
            handleMessage: jest.fn() as any,
            handleInteraction: jest.fn() as any
        } as GameCommand;
        jest.mocked(GameCommand).mockImplementation(() => gameCommand);
        bot = new TicTacToeBot(configuration, eventHandler);
    });

    test('should retrieve configuration', () => {
        expect(bot.configuration).toEqual(configuration);
    });

    test('should retrieve eventHandler', () => {
        expect(bot.eventHandler).toEqual(eventHandler);
    });

    describe('Attach to client', () => {
        let notReadyClient: Client;
        let readyClient: Client;

        beforeEach(() => {
            notReadyClient = { readyAt: false as any, on: jest.fn() as any } as Client;
            readyClient = { readyAt: true as any, on: jest.fn() as any } as Client;
        });

        test('should attach slash command now if client is ready', () => {
            configuration.command = 'command';
            const spyAppCommandRegister = jest.mocked(AppCommandRegister);
            const commands = [{ id: 'command1' }];
            const client = { ...readyClient, application: { commands } as any } as Client;

            bot.attachToClient(client);

            expect(spyAppCommandRegister).toHaveBeenCalledTimes(1);
            expect(spyAppCommandRegister).toHaveBeenCalledWith(commands, 'command', 'opponent');
            expect(client.on).toHaveBeenCalledTimes(2);
            expect(client.on).toHaveBeenCalledWith('messageCreate', expect.anything());
            expect(client.on).toHaveBeenCalledWith('interactionCreate', expect.anything());
        });

        test('should attach text command now if client is ready', () => {
            configuration.textCommand = 'command';
            bot.attachToClient(readyClient);
            expect(readyClient.on).toHaveBeenCalledTimes(1);
            expect(readyClient.on).toHaveBeenCalledWith('messageCreate', expect.anything());
        });

        test('should bind attach function to ready event if still waiting', () => {
            bot.attachToClient(notReadyClient);
            expect(notReadyClient.on).toHaveBeenCalledTimes(1);
            expect(notReadyClient.on).toHaveBeenCalledWith('ready', expect.anything());
        });
    });

    test('should call handleMessage from command', () => {
        const message = { id: '123456' } as Message;
        bot.handleMessage(message);
        expect(gameCommand.handleMessage).toHaveBeenCalledTimes(1);
        expect(gameCommand.handleMessage).toHaveBeenCalledWith(message, true);
    });

    test('should call handleInteraction from command', () => {
        const interaction = { id: '123456' } as CommandInteraction;
        bot.handleInteraction(interaction);
        expect(gameCommand.handleInteraction).toHaveBeenCalledTimes(1);
        expect(gameCommand.handleInteraction).toHaveBeenCalledWith(interaction, true);
    });
});
