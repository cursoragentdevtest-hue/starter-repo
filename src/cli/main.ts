import { runCli } from "./run-cli";

const exitCode = runCli(process.argv.slice(2), {
  stdout: (line) => {
    console.log(line);
  },
  stderr: (line) => {
    console.error(line);
  },
});

process.exit(exitCode);
