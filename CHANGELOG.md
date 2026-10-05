# Changelog

## Unreleased

### Added
- Runtime input validation for every public function that takes input. The React components take no props, so they need none.
  - `pickRandom` and `pickDifferent` (`src/lib/random.ts`): a non-array `items` throws `TypeError`, and an empty list throws `RangeError`. A random source that isn't a function throws `TypeError`. If `random()` returns anything outside `[0, 1)` (such as `1`, `NaN` or `-0.1`), they throw `RangeError` instead of quietly returning `undefined`. Error messages name the function and the bad value, for example `pickRandom: random() must return a number in [0, 1), got 1`.
  - CLI `run()`: a `TypeError` with a specific message if `argv` isn't an array of strings, or if `io.stdout`/`io.stderr` (or `io.random`, when given) isn't a function. Nothing is written to the output in that case.
- `silly quack --count` is now capped at 100 (`MAX_COUNT`). Larger values exit with code 2 instead of trying to print billions of lines.
- 46 error-path tests, bringing the suite to 85.

### Fixed
- `silly list constructor` (and other names inherited from `Object.prototype`, such as `toString`) crashed with exit code 1 and `items.map is not a function`. It is now a usage error with exit code 2.
- `silly fact` with no number used its own unchecked random index. It now goes through the validated `pickRandom`.

### Changed
- `src/lib/pickDifferent.ts` is now `src/lib/random.ts` and also exports `pickRandom`.
- `list` usage errors now say what was passed, for example `got "ducks"`.
