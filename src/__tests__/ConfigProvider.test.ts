import ConfigProvider from '@config/ConfigProvider';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

describe('ConfigProvider', () => {
    describe('Load from configuration file', () => {
        let configDirectory: string;
        let originalDirectory: string;

        beforeEach(() => {
            originalDirectory = process.cwd();
            configDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'discord-tictactoe-config-'));
            fs.mkdirSync(path.join(configDirectory, 'config'));
            process.chdir(configDirectory);
        });

        afterEach(() => {
            process.chdir(originalDirectory);
            fs.rmSync(configDirectory, { force: true, recursive: true });
        });

        test('should import configuration from file if exists', () => {
            fs.writeFileSync(
                path.join(configDirectory, 'config', 'config.json'),
                JSON.stringify({ foo: true, bar: 1 })
            );
            const provider = new ConfigProvider();
            expect(provider['foo']).toBeTruthy();
            expect(provider['bar']).toBe(1);
        });

        test('should do nothing if file does not exist', () => {
            const provider = new ConfigProvider();
            expect(provider['foo']).toBeUndefined();
        });
    });

    describe('Load from environment', () => {
        test('should load a number', () => {
            process.env = { REQUEST_EXPIRE_TIME: '30' };
            expect(new ConfigProvider().requestExpireTime).toBe(30);
        });

        test('should load a boolean', () => {
            process.env = { SIMULTANEOUS_GAMES: 'true' };
            expect(new ConfigProvider().simultaneousGames).toBeTruthy();
        });

        test('should load a string', () => {
            process.env = { COMMAND: 'cmd' };
            expect(new ConfigProvider().command).toBe('cmd');
        });

        test('should load an array', () => {
            process.env = { ALLOWED_ROLE_IDS: 'role1,role2' };
            expect(new ConfigProvider().allowedRoleIds).toEqual(['role1', 'role2']);
        });

        test('should ignore LANGUAGE variable', () => {
            process.env = { LANGUAGE: 'it' };
            expect(new ConfigProvider().language).toBe('en');
        });

        test('should not load an unknown variable', () => {
            process.env = { UNKNOWN: 'variable' };
            expect(new ConfigProvider()['unknown']).toBeFalsy();
        });

        test('should not load an invalid variable', () => {
            process.env = { REQUEST_EXPIRE_TIME: 'invalid' };
            expect(new ConfigProvider().requestExpireTime).toBe(60);
        });
    });
});
