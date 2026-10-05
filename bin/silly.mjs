#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "src", "cli.ts");

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", cli, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: process.env,
    cwd: root,
  },
);

process.exit(result.status ?? 1);
