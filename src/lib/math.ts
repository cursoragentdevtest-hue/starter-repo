/**
 * Numeric helpers for everyday calculations.
 *
 * Functions here are pure: they do not mutate their arguments and they throw
 * `RangeError` when a caller passes a value the operation cannot represent
 * (division by zero, non-finite input, or a negative where a count is required).
 */

/**
 * Restricts `value` to the inclusive range `[min, max]`.
 *
 * @param value - The number to restrict.
 * @param min - Lower bound.
 * @param max - Upper bound.
 * @returns `min` when `value` is smaller, `max` when it is larger, otherwise `value`.
 * @throws {RangeError} When `min` is greater than `max`.
 * @example
 * clamp(12, 0, 10);
 * // => 10
 * @example
 * clamp(-3, 0, 10);
 * // => 0
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError(`min (${min}) must be less than or equal to max (${max})`);
  }
  return Math.min(max, Math.max(min, value));
}

/**
 * Linearly interpolates between `start` and `end` by `t`.
 *
 * `t` is not clamped: values outside `[0, 1]` extrapolate past the endpoints.
 *
 * @param start - Value at `t = 0`.
 * @param end - Value at `t = 1`.
 * @param t - Interpolation amount.
 * @returns The interpolated number.
 * @example
 * lerp(0, 100, 0.25);
 * // => 25
 * @example
 * lerp(10, 20, 1.5);
 * // => 25
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Inverse of {@link lerp}: how far `value` sits between `start` and `end`.
 *
 * @param start - Range start.
 * @param end - Range end.
 * @param value - Sample inside or outside the range.
 * @returns `0` at `start`, `1` at `end`.
 * @throws {RangeError} When `start` and `end` are equal.
 * @example
 * inverseLerp(0, 100, 25);
 * // => 0.25
 * @example
 * inverseLerp(10, 20, 15);
 * // => 0.5
 */
export function inverseLerp(start: number, end: number, value: number): number {
  if (start === end) {
    throw new RangeError("start and end must differ");
  }
  return (value - start) / (end - start);
}

/**
 * Maps `value` from one range onto another.
 *
 * @param value - Sample in the source range.
 * @param inMin - Source range start.
 * @param inMax - Source range end.
 * @param outMin - Destination range start.
 * @param outMax - Destination range end.
 * @returns The remapped number.
 * @throws {RangeError} When `inMin` and `inMax` are equal.
 * @example
 * mapRange(5, 0, 10, 0, 100);
 * // => 50
 * @example
 * mapRange(0, 0, 10, 20, 40);
 * // => 20
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}

/**
 * Rounds `value` to `digits` digits after the decimal point.
 *
 * @param value - The number to round.
 * @param digits - Non-negative count of fractional digits. Defaults to `0`.
 * @returns The rounded number.
 * @throws {RangeError} When `digits` is negative or not an integer.
 * @example
 * roundTo(1.005, 2);
 * // => 1.01
 * @example
 * roundTo(1.2345, 0);
 * // => 1
 */
export function roundTo(value: number, digits = 0): number {
  if (!Number.isInteger(digits) || digits < 0) {
    throw new RangeError("digits must be a non-negative integer");
  }
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Greatest common divisor of two integers, via Euclid's algorithm.
 *
 * @param a - First integer.
 * @param b - Second integer.
 * @returns A non-negative integer.
 * @throws {RangeError} When either argument is not a finite integer.
 * @example
 * gcd(12, 18);
 * // => 6
 * @example
 * gcd(-8, 12);
 * // => 4
 */
export function gcd(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isFinite(a) || !Number.isFinite(b)) {
    throw new RangeError("gcd requires finite integers");
  }
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

/**
 * Least common multiple of two integers.
 *
 * @param a - First integer.
 * @param b - Second integer.
 * @returns A non-negative integer. `0` when either input is `0`.
 * @throws {RangeError} When either argument is not a finite integer.
 * @example
 * lcm(4, 6);
 * // => 12
 * @example
 * lcm(0, 5);
 * // => 0
 */
export function lcm(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isFinite(a) || !Number.isFinite(b)) {
    throw new RangeError("lcm requires finite integers");
  }
  if (a === 0 || b === 0) return 0;
  return Math.abs(a / gcd(a, b) * b);
}

/**
 * Whether `n` is a prime number.
 *
 * @param n - Candidate integer.
 * @returns `true` when `n` is prime.
 * @example
 * isPrime(17);
 * // => true
 * @example
 * isPrime(1);
 * // => false
 */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  const limit = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= limit; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Factorial of a non-negative integer.
 *
 * @param n - Non-negative integer.
 * @returns `n!`.
 * @throws {RangeError} When `n` is negative or not an integer.
 * @example
 * factorial(5);
 * // => 120
 * @example
 * factorial(0);
 * // => 1
 */
export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("factorial requires a non-negative integer");
  }
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

/**
 * Binomial coefficient `n` choose `k`.
 *
 * @param n - Size of the set.
 * @param k - Size of the subset.
 * @returns The number of ways to choose `k` items from `n`.
 * @throws {RangeError} When `n` or `k` is not a non-negative integer.
 * @example
 * combinations(5, 2);
 * // => 10
 * @example
 * combinations(4, 0);
 * // => 1
 */
export function combinations(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0) {
    throw new RangeError("combinations requires non-negative integers");
  }
  if (k > n) return 0;
  const kk = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= kk; i += 1) {
    result = (result * (n - kk + i)) / i;
  }
  return result;
}

/**
 * Sum of a list of numbers.
 *
 * @param values - Numbers to add.
 * @returns `0` for an empty list.
 * @example
 * sum([1, 2, 3, 4]);
 * // => 10
 * @example
 * sum([]);
 * // => 0
 */
export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Arithmetic mean of a list of numbers.
 *
 * @param values - Numbers to average. Must be non-empty.
 * @returns The mean.
 * @throws {RangeError} When `values` is empty.
 * @example
 * mean([2, 4, 6]);
 * // => 4
 * @example
 * mean([1, 2]);
 * // => 1.5
 */
export function mean(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError("mean of empty list");
  return sum(values) / values.length;
}

/**
 * Median of a list of numbers.
 *
 * Does not mutate `values`. Even-length lists return the mean of the two
 * central values.
 *
 * @param values - Numbers to summarize. Must be non-empty.
 * @returns The median.
 * @throws {RangeError} When `values` is empty.
 * @example
 * median([3, 1, 2]);
 * // => 2
 * @example
 * median([1, 2, 3, 4]);
 * // => 2.5
 */
export function median(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError("median of empty list");
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid]!;
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Population variance.
 *
 * @param values - Numbers to summarize. Must be non-empty.
 * @returns The variance.
 * @throws {RangeError} When `values` is empty.
 * @example
 * variance([2, 4, 4, 4, 5, 5, 7, 9]);
 * // => 4
 * @example
 * variance([1, 1, 1]);
 * // => 0
 */
export function variance(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError("variance of empty list");
  const avg = mean(values);
  return mean(values.map((value) => (value - avg) ** 2));
}

/**
 * Population standard deviation.
 *
 * @param values - Numbers to summarize. Must be non-empty.
 * @returns The standard deviation.
 * @throws {RangeError} When `values` is empty.
 * @example
 * stddev([2, 4, 4, 4, 5, 5, 7, 9]);
 * // => 2
 * @example
 * stddev([5, 5, 5]);
 * // => 0
 */
export function stddev(values: readonly number[]): number {
  return Math.sqrt(variance(values));
}

/**
 * Smallest value in the list.
 *
 * @param values - Numbers to scan. Must be non-empty.
 * @returns The minimum.
 * @throws {RangeError} When `values` is empty.
 * @example
 * min([3, 1, 2]);
 * // => 1
 * @example
 * min([-5, -1, -8]);
 * // => -8
 */
export function min(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError("min of empty list");
  return Math.min(...values);
}

/**
 * Largest value in the list.
 *
 * @param values - Numbers to scan. Must be non-empty.
 * @returns The maximum.
 * @throws {RangeError} When `values` is empty.
 * @example
 * max([3, 1, 2]);
 * // => 3
 * @example
 * max([-5, -1, -8]);
 * // => -1
 */
export function max(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError("max of empty list");
  return Math.max(...values);
}

/**
 * Positive remainder, so the result is always in `[0, m)`.
 *
 * @param n - Dividend.
 * @param m - Modulus. Must be positive.
 * @returns The wrapped remainder.
 * @throws {RangeError} When `m` is not positive or either argument is non-finite.
 * @example
 * mod(-1, 5);
 * // => 4
 * @example
 * mod(7, 5);
 * // => 2
 */
export function mod(n: number, m: number): number {
  if (!Number.isFinite(n) || !Number.isFinite(m) || m <= 0) {
    throw new RangeError("modulus must be a positive finite number");
  }
  return ((n % m) + m) % m;
}

/**
 * Integer division that truncates toward negative infinity.
 *
 * @param n - Dividend.
 * @param d - Divisor. Must be non-zero.
 * @returns The floored quotient.
 * @throws {RangeError} When `d` is `0`.
 * @example
 * floorDiv(-7, 3);
 * // => -3
 * @example
 * floorDiv(7, 3);
 * // => 2
 */
export function floorDiv(n: number, d: number): number {
  if (d === 0) throw new RangeError("division by zero");
  return Math.floor(n / d);
}

/**
 * Sign of a number as `-1`, `0`, or `1`.
 *
 * @param n - The number.
 * @returns `-1` for negatives, `0` for zero (including `-0`), `1` for positives.
 * @example
 * sign(-4);
 * // => -1
 * @example
 * sign(0);
 * // => 0
 */
export function sign(n: number): -1 | 0 | 1 {
  if (n === 0) return 0;
  return n < 0 ? -1 : 1;
}

/**
 * Approximate equality within an absolute tolerance.
 *
 * @param a - First number.
 * @param b - Second number.
 * @param epsilon - Maximum allowed absolute difference. Defaults to `1e-9`.
 * @returns Whether `|a - b|` is within `epsilon`.
 * @example
 * approximatelyEqual(0.1 + 0.2, 0.3);
 * // => true
 * @example
 * approximatelyEqual(1, 1.01, 0.001);
 * // => false
 */
export function approximatelyEqual(a: number, b: number, epsilon = 1e-9): boolean {
  return Math.abs(a - b) <= epsilon;
}

/**
 * Whether `n` is a perfect square of an integer.
 *
 * @param n - Candidate.
 * @returns `true` when some integer squared equals `n`.
 * @example
 * isPerfectSquare(16);
 * // => true
 * @example
 * isPerfectSquare(15);
 * // => false
 */
export function isPerfectSquare(n: number): boolean {
  if (!Number.isFinite(n) || n < 0 || !Number.isSafeInteger(n)) return false;
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
}

/**
 * Sum of decimal digits, ignoring sign.
 *
 * @param n - Finite integer.
 * @returns The digit sum.
 * @throws {RangeError} When `n` is not a finite integer.
 * @example
 * sumOfDigits(-123);
 * // => 6
 * @example
 * sumOfDigits(0);
 * // => 0
 */
export function sumOfDigits(n: number): number {
  if (!Number.isInteger(n) || !Number.isFinite(n)) {
    throw new RangeError("sumOfDigits requires a finite integer");
  }
  const digits = Math.abs(n).toString();
  let total = 0;
  for (const ch of digits) total += Number(ch);
  return total;
}

/**
 * The `n`th Fibonacci number, with `fibonacci(0) === 0` and `fibonacci(1) === 1`.
 *
 * @param n - Zero-based index.
 * @returns The Fibonacci number.
 * @throws {RangeError} When `n` is negative or not an integer.
 * @example
 * fibonacci(10);
 * // => 55
 * @example
 * fibonacci(0);
 * // => 0
 */
export function fibonacci(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("fibonacci requires a non-negative integer");
  }
  if (n < 2) return n;
  let prev = 0;
  let curr = 1;
  for (let i = 2; i <= n; i += 1) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}

/**
 * Degrees to radians.
 *
 * @param degrees - Angle in degrees.
 * @returns Angle in radians.
 * @example
 * degToRad(180);
 * // => Math.PI
 * @example
 * degToRad(0);
 * // => 0
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Radians to degrees.
 *
 * @param radians - Angle in radians.
 * @returns Angle in degrees.
 * @example
 * radToDeg(Math.PI);
 * // => 180
 * @example
 * radToDeg(0);
 * // => 0
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Normalizes an angle in degrees into the half-open range `[0, 360)`.
 *
 * @param degrees - Angle in degrees.
 * @returns The wrapped angle.
 * @example
 * normalizeDegrees(-90);
 * // => 270
 * @example
 * normalizeDegrees(360);
 * // => 0
 */
export function normalizeDegrees(degrees: number): number {
  return mod(degrees, 360);
}

/**
 * Next prime strictly greater than `n`.
 *
 * @param n - Starting point. Non-integers are ceiled first.
 * @returns A prime greater than `n`.
 * @throws {RangeError} When `n` is not finite.
 * @example
 * nextPrime(14);
 * // => 17
 * @example
 * nextPrime(2);
 * // => 3
 */
export function nextPrime(n: number): number {
  if (!Number.isFinite(n)) throw new RangeError("nextPrime requires a finite number");
  let candidate = Math.ceil(n) + 1;
  if (candidate <= 2) return 2;
  if (candidate % 2 === 0) candidate += 1;
  while (!isPrime(candidate)) candidate += 2;
  return candidate;
}

/**
 * Product of a list of numbers.
 *
 * @param values - Numbers to multiply.
 * @returns `1` for an empty list.
 * @example
 * product([2, 3, 4]);
 * // => 24
 * @example
 * product([]);
 * // => 1
 */
export function product(values: readonly number[]): number {
  return values.reduce((total, value) => total * value, 1);
}

/**
 * Percent change from `from` to `to`.
 *
 * @param from - Baseline. Must be non-zero.
 * @param to - New value.
 * @returns Change as a percentage. `100` means the value doubled.
 * @throws {RangeError} When `from` is `0`.
 * @example
 * percentChange(50, 75);
 * // => 50
 * @example
 * percentChange(80, 60);
 * // => -25
 */
export function percentChange(from: number, to: number): number {
  if (from === 0) throw new RangeError("percent change from zero");
  return ((to - from) / Math.abs(from)) * 100;
}
