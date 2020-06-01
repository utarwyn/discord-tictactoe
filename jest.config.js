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
        '@tictactoe/(.*)': '<rootDir>/src/tictactoe/$1'
    },
    moduleFileExtensions: ['js', 'json', 'ts'],
    coverageDirectory: 'coverage',
    collectCoverage: true,
    coverageReporters: ['lcov'],
    coveragePathIgnorePatterns: ['/node_modules/', '.d.ts']
};
