#!/usr/bin/env node
import { run } from "./lib/cli";

process.exitCode = run(process.argv.slice(2));
