# Changelog

## Unreleased

### Added

- Shared `ValidationError` helpers in `src/lib/assert.ts` with consistent `functionName: message` formatting.
- Validated public content accessors `getFactAt` and `getQuackAt`.
- Error-path tests for array helpers, content accessors, and CLI argument validation.

### Changed

- `nextCircularIndex` and `pickRandomElement` now validate all inputs (including `random()` return values) before use.
- `runCli` validates `argv`, `io`, and `options` up front; fact indices use stricter parsing and clearer stderr messages.
