import AppCommandRegister from '@bot/command/AppCommandRegister';
import { ApplicationCommandManager, Message } from 'discord.js';

jest.mock('@i18n/localize');

describe('AppCommandRegister', () => {
    let commandManager: ApplicationCommandManager;
    let register: AppCommandRegister;

    beforeEach(() => {
        commandManager = {
            create: jest.fn() as any,
            delete: jest.fn() as any,
            fetch: jest.fn() as any
        } as ApplicationCommandManager;
        register = new AppCommandRegister(commandManager, 'tictactoe', 'opponent');
    });

    describe('Handle deploy message', () => {
        const message = {
            client: { user: 'userId' } as any,
            content: '@bot tttdeploy',
            guild: { id: 'guildId' },
            member: { permissions: new Map([['ADMINISTRATOR', '']]) } as any,
            mentions: new Map([['userId', '']]) as any,
            reply: jest.fn() as any
        } as Message;

        describe('Check rights', () => {
            test.each`
                message                                               | description
                ${{ ...message, guild: null }}                        | ${'does not have guild'}
                ${{ ...message, member: null }}                       | ${'does not have member'}
                ${{ ...message, client: { user: null } }}             | ${'does not have user'}
                ${{ ...message, mentions: new Map() }}                | ${'does not have mention the bot'}
                ${{ ...message, member: { permissions: new Map() } }} | ${'does not have permission'}
                ${{ ...message, content: 'bad' }}                     | ${'contains only one word'}
                ${{ ...message, content: '@bot bad' }}                | ${'contains an invalid action'}
            `('should do nothing if message $description', async ({ message }) => {
                await register.handleDeployMessage(message);
                expect(commandManager.create).toHaveBeenCalledTimes(0);
            });
        });

        describe('Action: tttdeploy', () => {
            beforeEach(() => (message.content = '@bot tttdeploy'));

            test('should register command in guild with action tttdeploy', async () => {
                await register.handleDeployMessage(message);
                expect(commandManager.create).toHaveBeenCalledTimes(1);
                expect(commandManager.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'tictactoe',
                        options: [expect.objectContaining({ name: 'opponent' })]
                    }),
                    'guildId'
                );
            });

            test('should reply to sender', async () => {
                await register.handleDeployMessage(message);
                expect(message.reply).toHaveBeenCalledTimes(1);
                expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('registered'));
            });
        });

        describe('Action: tttdelete', () => {
            beforeEach(() => (message.content = '@bot tttdelete'));

            test('should delete registered command if found', async () => {
                const spyFetch = jest
                    .spyOn(commandManager, 'fetch')
                    .mockResolvedValue([{ id: '123456', name: 'tictactoe' }] as any);

                await register.handleDeployMessage(message);

                expect(spyFetch).toHaveBeenCalledTimes(1);
                expect(spyFetch).toHaveBeenCalledWith({ guildId: 'guildId' });
                expect(commandManager.delete).toHaveBeenCalledTimes(1);
                expect(commandManager.delete).toHaveBeenCalledWith('123456', 'guildId');
                expect(message.reply).toHaveBeenCalledTimes(1);
                expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('unregistered'));
            });

            test('should do nothing if command not found', async () => {
                await register.handleDeployMessage(message);
                expect(commandManager.delete).toHaveBeenCalledTimes(0);
                expect(message.reply).toHaveBeenCalledTimes(1);
                expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('not found'));
            });
        });
    });
});
