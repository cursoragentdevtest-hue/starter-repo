# Changelog

## 0.1.1

- Validate every public helper (`nextCyclicIndex`, `pickDifferentIndex`, `getQuote`, `parseArgs`, `run`) with named, value-including error messages.
- CLI now rejects mismatched flags (`--next`/`--index` with `quack`, `--from` with `fact`), out-of-range `--from`, missing option values, and non-string argv.
- Added error-path tests for cycle, quotes, validators, and the CLI (including the spawned entry point).
