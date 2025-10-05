module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/server.js',
      '!src/tests/**',
      '!src/config/**',  // Exclude config (tested via integration)
      '!src/graphql/**'  // Exclude GraphQL (tested via integration)
    ],
    coverageThreshold: {
      global: {
        branches: 50,
        functions: 60,
        lines: 60,
        statements: 60
      }
    },
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js']
  };