# Changelog

## Unreleased

### Changed
- Hardened public catalog helpers (`pickQuack`, `pickFact`, `getQuack`, `getFact`) with type/range checks and explicit error messages for bad random sources and indexes.
- Hardened `runCli` / `UsageError` against invalid programmatic inputs (`argv`, `io`, empty messages) and clarified CLI usage errors for unknown commands, empty `--index`, and bad `list` usage.

### Tests
- Added error-path coverage for catalog validation and CLI argument/`io` failures.
