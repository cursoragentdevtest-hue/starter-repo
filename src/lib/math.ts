/**
 * Numeric helpers. Predicates return false for values they do not accept.
 * Operations throw `RangeError` for inputs they cannot compute.
 */

/**
 * Restrict `value` to the closed interval between `min` and `max`.
 * The bounds are swapped when `min` is greater than `max`.
 *
 * @example
 * clamp(5, 0, 10); // 5
 *
 * @example
 * clamp(-1, 10, 0); // 0
 */
export function clamp(value: number, min: number, max: number): number {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return Math.min(high, Math.max(low, value));
}

/**
 * Linearly interpolate from `start` to `end` by `t`.
 * `t` is not clamped, so values outside `[0, 1]` extrapolate.
 *
 * @example
 * lerp(0, 10, 0.5); // 5
 *
 * @example
 * lerp(10, 20, 0); // 10
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Round `value` to `digits` places after the decimal point.
 * Uses `Math.round`, which rounds halves toward +infinity.
 *
 * @example
 * roundTo(3.14159, 2); // 3.14
 *
 * @example
 * roundTo(2.5, 0); // 3
 *
 * @example
 * roundTo(Math.PI, 4); // 3.1416
 */
export function roundTo(value: number, digits: number): number {
  if (!Number.isInteger(digits) || digits < 0) {
    throw new RangeError("digits must be a non-negative integer");
  }
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * Greatest common divisor of `a` and `b`.
 * Signs are ignored and both values are truncated toward zero.
 * Throws when either argument is not finite.
 *
 * @example
 * gcd(12, 18); // 6
 *
 * @example
 * gcd(-4, 6); // 2
 */
export function gcd(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new RangeError("gcd arguments must be finite");
  }
  let x = Math.trunc(Math.abs(a));
  let y = Math.trunc(Math.abs(b));
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

/**
 * Least common multiple of `a` and `b`.
 * Signs are ignored and both values are truncated toward zero.
 * Returns `0` when either truncated value is `0`. Throws when either argument is not finite.
 *
 * @example
 * lcm(4, 6); // 12
 *
 * @example
 * lcm(0, 5); // 0
 */
export function lcm(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new RangeError("lcm arguments must be finite");
  }
  const x = Math.trunc(Math.abs(a));
  const y = Math.trunc(Math.abs(b));
  if (x === 0 || y === 0) return 0;
  return (x / gcd(x, y)) * y;
}

/**
 * Whether `n` is a prime number.
 * Non-integers are not prime: `4.0` is the integer `4` (composite) and `4.5` is not prime.
 *
 * @example
 * isPrime(2); // true
 *
 * @example
 * isPrime(4); // false
 *
 * @example
 * isPrime(4.5); // false
 */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  const limit = Math.floor(Math.sqrt(n));
  for (let factor = 3; factor <= limit; factor += 2) {
    if (n % factor === 0) return false;
  }
  return true;
}

/**
 * Factorial of a non-negative integer.
 * Throws `RangeError` for negative numbers and non-integers.
 *
 * @example
 * factorial(0); // 1
 *
 * @example
 * factorial(5); // 120
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
 * The `n`th Fibonacci number, with `fibonacci(0) === 0` and `fibonacci(1) === 1`.
 * Throws `RangeError` for negative numbers and non-integers.
 *
 * @example
 * fibonacci(0); // 0
 *
 * @example
 * fibonacci(6); // 8
 */
export function fibonacci(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("fibonacci requires a non-negative integer");
  }
  if (n === 0) return 0;
  if (n === 1) return 1;
  let previous = 0;
  let current = 1;
  for (let i = 2; i <= n; i += 1) {
    const next = previous + current;
    previous = current;
    current = next;
  }
  return current;
}

/**
 * Sum of `values`. An empty list sums to `0`.
 *
 * @example
 * sum([1, 2, 3]); // 6
 *
 * @example
 * sum([]); // 0
 */
export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Arithmetic mean of `values`.
 * Throws `RangeError` when `values` is empty.
 *
 * @example
 * mean([2, 4, 6]); // 4
 *
 * @example
 * mean([1, 2]); // 1.5
 */
export function mean(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError("mean of empty list");
  return sum(values) / values.length;
}

/**
 * Median of `values`. Even-length lists use the mean of the two central values.
 * The input is not mutated. Throws `RangeError` when `values` is empty.
 *
 * @example
 * median([1, 3, 2]); // 2
 *
 * @example
 * median([1, 2, 3, 4]); // 2.5
 */
export function median(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError("median of empty list");
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

/**
 * Restrict `value` to the closed interval `[0, 1]`.
 *
 * @example
 * clamp01(2); // 1
 *
 * @example
 * clamp01(-0.2); // 0
 */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * Inverse of {@link lerp}: how far `value` sits between `start` and `end`.
 * Returns `0` when `start` and `end` are equal.
 *
 * @example
 * inverseLerp(0, 10, 5); // 0.5
 *
 * @example
 * inverseLerp(2, 2, 9); // 0
 */
export function inverseLerp(start: number, end: number, value: number): number {
  if (start === end) return 0;
  return (value - start) / (end - start);
}

/**
 * Map `value` from the input range onto the output range.
 * Does not clamp, so values outside the input range extrapolate.
 *
 * @example
 * remap(5, 0, 10, 0, 100); // 50
 *
 * @example
 * remap(0, 0, 1, 10, 20); // 10
 */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}

/**
 * Positive remainder of `value` modulo `modulus` when `modulus` is positive.
 * Throws when `value` is not finite, or when `modulus` is `0` or not finite.
 *
 * @example
 * mod(5, 3); // 2
 *
 * @example
 * mod(-1, 3); // 2
 */
export function mod(value: number, modulus: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(modulus) || modulus === 0) {
    throw new RangeError("mod requires a finite value and a non-zero finite modulus");
  }
  return ((value % modulus) + modulus) % modulus;
}

/**
 * Convert degrees to radians.
 *
 * @example
 * degToRad(180); // Math.PI
 *
 * @example
 * degToRad(0); // 0
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees.
 *
 * @example
 * radToDeg(Math.PI); // 180
 *
 * @example
 * radToDeg(0); // 0
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Whether `n` is an even integer. Non-integers return false.
 *
 * @example
 * isEven(4); // true
 *
 * @example
 * isEven(4.5); // false
 */
export function isEven(n: number): boolean {
  return Number.isInteger(n) && n % 2 === 0;
}

/**
 * Whether `n` is an odd integer. Non-integers return false.
 *
 * @example
 * isOdd(-3); // true
 *
 * @example
 * isOdd(2); // false
 */
export function isOdd(n: number): boolean {
  return Number.isInteger(n) && Math.abs(n % 2) === 1;
}

/**
 * Euclidean length of the vector `(x, y)`.
 *
 * @example
 * hypot(3, 4); // 5
 *
 * @example
 * hypot(0, 0); // 0
 */
export function hypot(x: number, y: number): number {
  return Math.hypot(x, y);
}

/**
 * Distance between the points `(x1, y1)` and `(x2, y2)`.
 *
 * @example
 * distance(0, 0, 3, 4); // 5
 *
 * @example
 * distance(1, 1, 1, 1); // 0
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Whether `a` and `b` differ by at most `epsilon`.
 * The default epsilon is `1e-9`.
 *
 * @example
 * approximatelyEqual(0.1 + 0.2, 0.3); // true
 *
 * @example
 * approximatelyEqual(1, 1.1, 0.05); // false
 */
export function approximatelyEqual(a: number, b: number, epsilon = 1e-9): boolean {
  return Math.abs(a - b) <= epsilon;
}

/**
 * `part` as a percentage of `whole`.
 * Throws when `whole` is `0`.
 *
 * @example
 * percentOf(1, 4); // 25
 *
 * @example
 * percentOf(3, 2); // 150
 */
export function percentOf(part: number, whole: number): number {
  if (whole === 0) throw new RangeError("whole must be non-zero");
  return (part / whole) * 100;
}

/**
 * Product of `values`. An empty list returns `1`.
 *
 * @example
 * product([2, 3, 4]); // 24
 *
 * @example
 * product([]); // 1
 */
export function product(values: readonly number[]): number {
  return values.reduce((total, value) => total * value, 1);
}

/**
 * Hermite smoothstep between `edge0` and `edge1`.
 * The input is clamped to the edge interval before the polynomial is applied.
 *
 * @example
 * smoothstep(0, 1, 0); // 0
 *
 * @example
 * smoothstep(0, 1, 0.5); // 0.5
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01(inverseLerp(edge0, edge1, x));
  return t * t * (3 - 2 * t);
}

/**
 * Snap `value` to the nearest multiple of `step`.
 * Halves follow `Math.round` and move toward +infinity. Throws when `step` is `0` or not finite.
 *
 * @example
 * snap(5.1, 2); // 6
 *
 * @example
 * snap(2.5, 0); // throws RangeError
 */
export function snap(value: number, step: number): number {
  if (!Number.isFinite(step) || step === 0) {
    throw new RangeError("step must be a non-zero finite number");
  }
  return Math.round(value / step) * step;
}

/**
 * Sum of the decimal digits of `n` after truncating toward zero.
 * The sign is ignored. Throws when `n` is not finite.
 *
 * @example
 * sumOfDigits(19); // 10
 *
 * @example
 * sumOfDigits(-10.9); // 1
 */
export function sumOfDigits(n: number): number {
  if (!Number.isFinite(n)) throw new RangeError("n must be finite");
  const digits = Math.trunc(Math.abs(n)).toString();
  let total = 0;
  for (const digit of digits) total += Number(digit);
  return total;
}

/**
 * Whether `n` is a perfect square.
 * Returns false unless `n` is a safe integer greater than or equal to `0`.
 * The root check uses `Math.round(Math.sqrt(n))`.
 *
 * @example
 * isPerfectSquare(49); // true
 *
 * @example
 * isPerfectSquare(-4); // false
 */
export function isPerfectSquare(n: number): boolean {
  if (!Number.isSafeInteger(n) || n < 0) return false;
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
}

/**
 * Smallest prime strictly greater than `n`.
 * `n` is truncated toward zero before the search starts.
 * Throws when `n` is not finite, and when no safe-integer prime follows `n`.
 *
 * @example
 * nextPrime(2); // 3
 *
 * @example
 * nextPrime(14); // 17
 */
export function nextPrime(n: number): number {
  if (!Number.isFinite(n)) throw new RangeError("n must be finite");
  let candidate = Math.max(2, Math.trunc(n) + 1);
  if (candidate > 2 && candidate % 2 === 0) candidate += 1;
  while (candidate <= Number.MAX_SAFE_INTEGER) {
    if (isPrime(candidate)) return candidate;
    candidate += 2;
  }
  throw new RangeError("no safe integer prime follows n");
}

/**
 * Population variance of `values`, using divisor `n` rather than `n - 1`.
 * Throws `RangeError` when `values` is empty.
 *
 * @example
 * variance([1, 2, 3]); // 2 / 3
 *
 * @example
 * variance([4, 4, 4]); // 0
 */
export function variance(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError("variance of empty list");
  const average = mean(values);
  return values.reduce((total, value) => total + (value - average) ** 2, 0) / values.length;
}
