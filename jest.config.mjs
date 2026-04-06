import path from 'node:path';
import { createDefaultPreset, pathsToModuleNameMapper } from 'ts-jest';
import tsConfig from './tsconfig.json' with { type: 'json' };

/** @type {import("jest").Config} **/
export default {
  clearMocks: true,
  testEnvironment: 'node',
  transform: createDefaultPreset().transform,
  roots: ['<rootDir>/src'],
  moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
    prefix: '<rootDir>/'
  }),
  globals: {
    __dirname: path.join(path.dirname(new URL(import.meta.url).pathname), 'test', 'runtime', 'env')
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*']
};
