import { readFileSync } from "fs";
import { getFromRootPath } from "../lib/utils/utils";
import { constantCase } from "change-case";

const rawStackOutput = readFileSync(getFromRootPath("output.json"), {
  encoding: "utf-8"
});

const parsedStackOutput = JSON.parse(rawStackOutput);

const stackOutputProperties = Object.entries<Record<string, string>>(
  parsedStackOutput
)[0][1];

Object.entries<string>(stackOutputProperties).forEach(([key, value]) => {
  process.env[constantCase(key)] = value;
});
