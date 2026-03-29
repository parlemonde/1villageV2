import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    dir: './',
});

const config: Config = {
    coverageProvider: 'v8',
    moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/src/app/$1',
        '^@frontend/(.*)$': '<rootDir>/src/frontend/$1',
        '^@lib/(.*)$': '<rootDir>/src/lib/$1',
        '^@server/(.*)$': '<rootDir>/src/server/$1',
        '^@server-actions/(.*)$': '<rootDir>/src/server-actions/$1',
        '^.+\\.module\\.css$': 'identity-obj-proxy',
        '^.+\\.css$': 'identity-obj-proxy',
        '^.+\\.svg$': '<rootDir>/src/test/svg.mocks.js',
    },
    modulePathIgnorePatterns: ['<rootDir>/.next/'],
    setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.ts'],
    testEnvironment: 'jsdom',
    watchman: false,
};

export default createJestConfig(config);
