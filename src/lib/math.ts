/**
 * Numeric helpers for the Silly Starter.
 *
 * Every function is pure. Non-finite numbers are rejected with `RangeError`
 * wherever a silent `NaN` or an infinite loop would otherwise leak out.
 */

function requireFinite(value: number, name = "value"): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number.`);
  }
  return value;
}

function requireFiniteNumbers(values: readonly number[], name = "values"): void {
  for (const value of values) {
    requireFinite(value, name);
  }
}

/**
 * Restrict `value` to the inclusive range `[min, max]`.
 *
 * @example
 * clamp(12, 0, 10); // 10
 * @example
 * clamp(-3, 0, 10); // 0
 */
export function clamp(value: number, min: number, max: number): number {
  requireFinite(value, "value");
  requireFinite(min, "min");
  requireFinite(max, "max");
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
 * @example
 * lerp(0, 10, 2); // 20
 */
export function lerp(start: number, end: number, t: number): number {
  requireFinite(start, "start");
  requireFinite(end, "end");
  requireFinite(t, "t");
  return start + (end - start) * t;
}

/**
 * Round `value` to `digits` digits after the decimal point.
 *
 * @example
 * roundTo(1.005, 2); // 1.01
 * @example
 * roundTo(1.2345, 0); // 1
 */
export function roundTo(value: number, digits = 0): number {
  requireFinite(value, "value");
  if (!Number.isInteger(digits) || digits < 0 || digits > 15) {
    throw new RangeError("digits must be an integer from 0 to 15.");
  }
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Greatest common divisor of two integers.
 *
 * @example
 * gcd(12, 18); // 6
 * @example
 * gcd(-8, 12); // 4
 */
export function gcd(a: number, b: number): number {
  requireFinite(a, "a");
  requireFinite(b, "b");
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new RangeError("gcd expects integers.");
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
 * @example
 * lcm(4, 6); // 12
 * @example
 * lcm(0, 5); // 0
 */
export function lcm(a: number, b: number): number {
  requireFinite(a, "a");
  requireFinite(b, "b");
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.trunc(a / gcd(a, b)) * b);
}

/**
 * Whether `value` is a prime integer.
 * Values outside the safe integer range return `false`.
 *
 * @example
 * isPrime(17); // true
 * @example
 * isPrime(1); // false
 */
export function isPrime(value: number): boolean {
  if (!Number.isInteger(value) || value < 2) return false;
  if (!Number.isSafeInteger(value)) return false;
  if (value % 2 === 0) return value === 2;
  const limit = Math.floor(Math.sqrt(value));
  for (let factor = 3; factor <= limit; factor += 2) {
    if (value % factor === 0) return false;
  }
  return true;
}

/**
 * Factorial of a non-negative integer up to 170.
 *
 * @example
 * factorial(5); // 120
 * @example
 * factorial(0); // 1
 */
export function factorial(value: number): number {
  requireFinite(value, "value");
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError("factorial expects a non-negative integer.");
  }
  if (value > 170) {
    throw new RangeError("factorial argument is too large.");
  }
  let result = 1;
  for (let i = 2; i <= value; i += 1) result *= i;
  return result;
}

/**
 * The `n`th Fibonacci number, with `fibonacci(0) === 0` and `fibonacci(1) === 1`.
 *
 * @example
 * fibonacci(10); // 55
 * @example
 * fibonacci(1); // 1
 */
export function fibonacci(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("fibonacci expects a non-negative integer.");
  }
  if (n > 78) {
    throw new RangeError("fibonacci argument is too large for a safe integer.");
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
 * Sum of a list of finite numbers.
 *
 * @example
 * sum([1, 2, 3]); // 6
 * @example
 * sum([]); // 0
 */
export function sum(values: readonly number[]): number {
  requireFiniteNumbers(values, "values");
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Arithmetic mean. An empty list throws.
 *
 * @example
 * mean([2, 4, 6]); // 4
 */
export function mean(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("mean expects at least one value.");
  }
  return sum(values) / values.length;
}

/**
 * Median of a list. Even lengths average the two middle values.
 *
 * @example
 * median([3, 1, 2]); // 2
 * @example
 * median([1, 2, 3, 4]); // 2.5
 */
export function median(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("median expects at least one value.");
  }
  requireFiniteNumbers(values, "values");
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/** @example clamp01(1.4); // 1 */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * Inverse of {@link lerp}: where `value` sits between `start` and `end`.
 *
 * @example
 * inverseLerp(0, 10, 5); // 0.5
 */
export function inverseLerp(start: number, end: number, value: number): number {
  requireFinite(start, "start");
  requireFinite(end, "end");
  requireFinite(value, "value");
  if (start === end) {
    throw new RangeError("inverseLerp requires start and end to differ.");
  }
  return (value - start) / (end - start);
}

/**
 * Map `value` from one range onto another.
 *
 * @example
 * remap(5, 0, 10, 0, 100); // 50
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
 * Positive modulo. The result is always in `[0, abs(modulus))`.
 *
 * @example
 * mod(-1, 5); // 4
 * @example
 * mod(7, 5); // 2
 */
export function mod(value: number, modulus: number): number {
  requireFinite(value, "value");
  requireFinite(modulus, "modulus");
  if (modulus === 0) throw new RangeError("modulus must not be zero.");
  return ((value % modulus) + modulus) % modulus;
}

/** @example degToRad(180); // Math.PI */
export function degToRad(degrees: number): number {
  requireFinite(degrees, "degrees");
  return (degrees * Math.PI) / 180;
}

/** @example radToDeg(Math.PI); // 180 */
export function radToDeg(radians: number): number {
  requireFinite(radians, "radians");
  return (radians * 180) / Math.PI;
}

/** @example isEven(4); // true */
export function isEven(value: number): boolean {
  return Number.isInteger(value) && value % 2 === 0;
}

/** @example isOdd(3); // true */
export function isOdd(value: number): boolean {
  return Number.isInteger(value) && Math.abs(value % 2) === 1;
}

/**
 * Euclidean length of a vector. An empty vector returns `0`.
 *
 * @example
 * hypot(3, 4); // 5
 */
export function hypot(...components: number[]): number {
  if (components.length === 0) return 0;
  requireFiniteNumbers(components, "components");
  return Math.hypot(...components);
}

/**
 * Distance between two points of the same dimension.
 *
 * @example
 * distance([0, 0], [3, 4]); // 5
 */
export function distance(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length) {
    throw new RangeError("distance expects points of the same dimension.");
  }
  if (a.length === 0) return 0;
  requireFiniteNumbers(a, "a");
  requireFiniteNumbers(b, "b");
  const deltas = a.map((value, index) => value - b[index]);
  return Math.hypot(...deltas);
}

/**
 * Whether two numbers are within `epsilon` of each other.
 *
 * @example
 * approximatelyEqual(0.1 + 0.2, 0.3);
 */
export function approximatelyEqual(
  a: number,
  b: number,
  epsilon = 1e-9,
): boolean {
  requireFinite(a, "a");
  requireFinite(b, "b");
  requireFinite(epsilon, "epsilon");
  if (epsilon < 0) throw new RangeError("epsilon must be non-negative.");
  return Math.abs(a - b) <= epsilon;
}

/**
 * `percent` percent of `whole`.
 *
 * @example
 * percentOf(25, 200); // 50
 */
export function percentOf(percent: number, whole: number): number {
  requireFinite(percent, "percent");
  requireFinite(whole, "whole");
  return (percent / 100) * whole;
}

/**
 * Product of a list. An empty list returns `1`.
 *
 * @example
 * product([2, 3, 4]); // 24
 */
export function product(values: readonly number[]): number {
  requireFiniteNumbers(values, "values");
  return values.reduce((total, value) => total * value, 1);
}

/**
 * Hermite smoothstep from `edge0` to `edge1`.
 *
 * @example
 * smoothstep(0, 1, 0.5); // 0.5
 */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  requireFinite(edge0, "edge0");
  requireFinite(edge1, "edge1");
  requireFinite(value, "value");
  if (edge0 === edge1) {
    throw new RangeError("smoothstep edges must differ.");
  }
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Snap `value` to the nearest multiple of `step`.
 *
 * @example
 * snap(11, 5); // 10
 */
export function snap(value: number, step: number): number {
  requireFinite(value, "value");
  requireFinite(step, "step");
  if (step === 0) throw new RangeError("step must not be zero.");
  return Math.round(value / step) * step;
}

/**
 * Sum of decimal digits, ignoring sign.
 *
 * @example
 * sumOfDigits(-19); // 10
 */
export function sumOfDigits(value: number): number {
  requireFinite(value, "value");
  if (!Number.isInteger(value)) {
    throw new RangeError("sumOfDigits expects an integer.");
  }
  const digits = Math.abs(value).toString();
  let total = 0;
  for (const digit of digits) total += Number(digit);
  return total;
}

/**
 * Whether `value` is a perfect square of an integer.
 * Non-safe integers return `false` so the check cannot overflow.
 *
 * @example
 * isPerfectSquare(16); // true
 * @example
 * isPerfectSquare(15); // false
 */
export function isPerfectSquare(value: number): boolean {
  if (!Number.isInteger(value) || value < 0) return false;
  if (!Number.isSafeInteger(value)) return false;
  const root = Math.round(Math.sqrt(value));
  return root * root === value;
}

/**
 * Smallest prime strictly greater than `value`.
 *
 * @example
 * nextPrime(14); // 17
 */
export function nextPrime(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError("value must be a finite number.");
  }
  let candidate = Math.floor(value) + 1;
  if (candidate < 2) candidate = 2;
  if (!Number.isSafeInteger(candidate)) {
    throw new RangeError("nextPrime exceeded the safe integer range.");
  }
  while (!isPrime(candidate)) {
    candidate += candidate === 2 ? 1 : 2;
    if (!Number.isSafeInteger(candidate)) {
      throw new RangeError("nextPrime exceeded the safe integer range.");
    }
  }
  return candidate;
}

/**
 * Population variance. An empty list throws.
 *
 * @example
 * variance([2, 4, 4, 4, 5, 5, 7, 9]); // 4
 */
export function variance(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("variance expects at least one value.");
  }
  const average = mean(values);
  const squared = values.reduce((total, value) => {
    const delta = value - average;
    return total + delta * delta;
  }, 0);
  return squared / values.length;
}
