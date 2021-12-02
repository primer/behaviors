/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

// eslint-disable-next-line filenames/match-regex
export default {
    clearMocks: true,
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    globals: {
      'ts-jest': {
        useESM: true
      }
    },
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
    }
  }
  