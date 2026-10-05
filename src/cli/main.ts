import { run } from "./silly";

// Set exitCode instead of calling process.exit() so piped stdout is fully flushed.
process.exitCode = run(process.argv.slice(2), {
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
});
