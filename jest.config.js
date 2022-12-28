module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/{!(index**),}.js'],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  testMatch: ['**/?(*.)+(spec).[jt]s?(x)'],
  transform: { '^.+\\.js$': '<rootDir>/node_modules/babel-jest' },
};
