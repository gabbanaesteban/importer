module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '@src/(.*)$': '<rootDir>/src/$1',
    '@tests/(.*)$': '<rootDir>/tests/$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/dist/', 'node_modules',
  ],
  // transform: {
  //   '^.+\\.ts$': ['ts-jest', {
  //     diagnostics: false,
  //     isolatedModules: true,
  //   }],
  // },
};

