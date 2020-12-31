import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  rootDir: "../",
  testMatch: ["**/*.test.ts"],
  displayName: "TEST",
  setupFiles: ["<rootDir>/test/setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/test/hooks.ts"]
};

export default config;
