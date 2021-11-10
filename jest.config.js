const path = require('path');

module.exports = {
    clearMocks: true,
    testEnvironment: 'node',
    transform: {
        '.ts': 'ts-jest'
    },
    roots: ['<rootDir>/src'],
    moduleNameMapper: {
        '@bot/(.*)': '<rootDir>/src/bot/$1',
        '@config/(.*)': '<rootDir>/src/config/$1',
        '@i18n/(.*)': '<rootDir>/src/i18n/$1',
        '@tictactoe/(.*)': '<rootDir>/src/tictactoe/$1'
    },
    globals: {
        __dirname: path.join(__dirname, 'test', 'runtime', 'env')
    },
    moduleFileExtensions: ['js', 'json', 'ts'],
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', '.d.ts']
};
