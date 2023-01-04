import ConfigProvider from '@config/ConfigProvider';
import fs from 'fs';

describe('ConfigProvider', () => {
    describe('Load from configuration file', () => {
        const fsMock = jest.mocked(fs);
        let configRequireFn: any;
        let configPath: string;

        beforeAll(() => {
            configPath = new ConfigProvider()['CONFIG_PATH'];
            configRequireFn = jest.fn().mockReturnValue({ foo: true, bar: 1 });
            jest.mock('fs');
            jest.mock(configPath, configRequireFn, { virtual: true });
        });

        test('should import configuration from file if exists', () => {
            const spyExistsSync = jest.spyOn(fsMock, 'existsSync').mockReturnValue(true);
            const provider = new ConfigProvider();
            expect(spyExistsSync).toHaveBeenCalledTimes(1);
            expect(spyExistsSync).toHaveBeenCalledWith(configPath);
            expect(configRequireFn).toHaveBeenCalledTimes(1);
            expect(provider['foo']).toBeTruthy();
            expect(provider['bar']).toBe(1);
        });

        test('should do nothing if file does not exist', () => {
            new ConfigProvider();
            expect(configRequireFn).toHaveBeenCalledTimes(0);
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
