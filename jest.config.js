/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  // transform: {
  //   "^.+.tsx?$": ["ts-jest",{}],
  // },
  preset: "ts-jest",
  testMatch: ["**/**/*.test.ts"],
  moduleNameMapper: {
    '^src/(.*)$': "<rootDir>/src/$1"
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: ["<rootDir>/src/"]
};