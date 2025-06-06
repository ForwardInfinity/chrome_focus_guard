/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["**/tests/unit/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  moduleFileExtensions: ["ts", "js", "json"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json"
    }
  }
};
