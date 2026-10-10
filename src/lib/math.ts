/**
 * Numeric helpers. Every function is pure: inputs are not mutated, and
 * invalid domains throw `RangeError` before any arithmetic runs.
 */

function assertFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number`);
  }
}

/**
 * Restrict `value` to the closed interval `[min, max]`.
 *
 * @example
 * clamp(12, 0, 10); // 10
 * clamp(-1, 0, 10); // 0
 */
export function clamp(value: number, min: number, max: number): number {
  assertFinite("value", value);
  assertFinite("min", min);
  assertFinite("max", max);
  if (min > max) {
    throw new RangeError("min must be less than or equal to max");
  }
  return Math.min(max, Math.max(min, value));
}

/**
 * Linearly interpolate from `a` to `b` by `t`.
 * `t` is not clamped, so values outside `[0, 1]` extrapolate.
 *
 * @example
 * lerp(0, 10, 0.5); // 5
 */
export function lerp(a: number, b: number, t: number): number {
  assertFinite("a", a);
  assertFinite("b", b);
  assertFinite("t", t);
  return a + (b - a) * t;
}

/**
 * Round `value` to `digits` places after the decimal point.
 *
 * @example
 * roundTo(1.2345, 2); // 1.23
 */
export function roundTo(value: number, digits: number): number {
  assertFinite("value", value);
  if (!Number.isInteger(digits) || digits < 0 || digits > 15) {
    throw new RangeError("digits must be an integer from 0 to 15");
  }
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Greatest common divisor of two integers, via the Euclidean algorithm.
 *
 * @example
 * gcd(12, 18); // 6
 */
export function gcd(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new RangeError("gcd arguments must be integers");
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
 */
export function lcm(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new RangeError("lcm arguments must be integers");
  }
  if (a === 0 || b === 0) {
    return 0;
  }
  const divisor = gcd(a, b);
  const magnitude = Math.abs(a / divisor) * Math.abs(b);
  if (!Number.isSafeInteger(magnitude)) {
    throw new RangeError("lcm result exceeds Number.MAX_SAFE_INTEGER");
  }
  return magnitude;
}

/**
 * Return whether `n` is a prime number.
 *
 * @example
 * isPrime(17); // true
 * isPrime(1); // false
 */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n)) {
    throw new RangeError("n must be an integer");
  }
  if (n <= 1) {
    return false;
  }
  if (n <= 3) {
    return true;
  }
  if (n % 2 === 0 || n % 3 === 0) {
    return false;
  }
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }
  return true;
}

/**
 * Factorial of a non-negative integer. Results past `20!` are not safe integers.
 *
 * @example
 * factorial(5); // 120
 */
export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("n must be a non-negative integer");
  }
  if (n > 20) {
    throw new RangeError("factorial is only defined for n <= 20");
  }
  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
  }
  return result;
}

/**
 * The `n`th Fibonacci number, with `fibonacci(0) === 0` and `fibonacci(1) === 1`.
 *
 * @example
 * fibonacci(10); // 55
 */
export function fibonacci(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("n must be a non-negative integer");
  }
  if (n > 78) {
    throw new RangeError("fibonacci is only defined for n <= 78");
  }
  let prev = 0;
  let current = 1;
  if (n === 0) {
    return 0;
  }
  for (let i = 2; i <= n; i += 1) {
    const next = prev + current;
    prev = current;
    current = next;
  }
  return current;
}

/**
 * Sum of a list of finite numbers.
 *
 * @example
 * sum([1, 2, 3]); // 6
 */
export function sum(values: readonly number[]): number {
  let total = 0;
  for (const value of values) {
    assertFinite("value", value);
    total += value;
  }
  return total;
}

/**
 * Arithmetic mean of a non-empty list.
 *
 * @example
 * mean([2, 4, 6]); // 4
 */
export function mean(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("mean requires at least one value");
  }
  return sum(values) / values.length;
}

/**
 * Median of a non-empty list. The input is not sorted in place.
 *
 * @example
 * median([3, 1, 2]); // 2
 * median([1, 2, 3, 4]); // 2.5
 */
export function median(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("median requires at least one value");
  }
  const sorted = [...values].sort((a, b) => a - b);
  for (const value of sorted) {
    assertFinite("value", value);
  }
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid]!;
  }
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Clamp a number to the unit interval `[0, 1]`.
 *
 * @example
 * clamp01(1.4); // 1
 */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * Inverse of {@link lerp}: where `value` sits between `a` and `b`.
 *
 * @example
 * inverseLerp(0, 10, 5); // 0.5
 */
export function inverseLerp(a: number, b: number, value: number): number {
  assertFinite("a", a);
  assertFinite("b", b);
  assertFinite("value", value);
  if (a === b) {
    throw new RangeError("a and b must differ");
  }
  return (value - a) / (b - a);
}

/**
 * Map `value` from `[inMin, inMax]` onto `[outMin, outMax]`.
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
 * Positive modulo. The result is always in `[0, abs(m))`.
 *
 * @example
 * mod(-1, 5); // 4
 */
export function mod(n: number, m: number): number {
  assertFinite("n", n);
  assertFinite("m", m);
  if (m === 0) {
    throw new RangeError("modulus must be non-zero");
  }
  return ((n % m) + m) % m;
}

/**
 * Convert degrees to radians.
 *
 * @example
 * degToRad(180); // Math.PI
 */
export function degToRad(degrees: number): number {
  assertFinite("degrees", degrees);
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees.
 *
 * @example
 * radToDeg(Math.PI); // 180
 */
export function radToDeg(radians: number): number {
  assertFinite("radians", radians);
  return (radians * 180) / Math.PI;
}

/**
 * Whether an integer is even.
 *
 * @example
 * isEven(4); // true
 */
export function isEven(n: number): boolean {
  if (!Number.isInteger(n)) {
    throw new RangeError("n must be an integer");
  }
  return n % 2 === 0;
}

/**
 * Whether an integer is odd.
 *
 * @example
 * isOdd(3); // true
 */
export function isOdd(n: number): boolean {
  return !isEven(n);
}

/**
 * Euclidean length of a vector.
 *
 * @example
 * hypot(3, 4); // 5
 */
export function hypot(...components: number[]): number {
  for (const component of components) {
    assertFinite("component", component);
  }
  return Math.hypot(...components);
}

/**
 * Distance between two points of equal dimension.
 *
 * @example
 * distance([0, 0], [3, 4]); // 5
 */
export function distance(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length) {
    throw new RangeError("points must have the same dimension");
  }
  if (a.length === 0) {
    throw new RangeError("points must have at least one coordinate");
  }
  const delta = a.map((value, index) => value - b[index]!);
  return hypot(...delta);
}

/**
 * Whether two numbers are within `epsilon` of each other.
 *
 * @example
 * approximatelyEqual(0.1 + 0.2, 0.3); // true
 */
export function approximatelyEqual(a: number, b: number, epsilon = 1e-10): boolean {
  assertFinite("a", a);
  assertFinite("b", b);
  assertFinite("epsilon", epsilon);
  if (epsilon < 0) {
    throw new RangeError("epsilon must be non-negative");
  }
  return Math.abs(a - b) <= epsilon;
}

/**
 * `percent` percent of `whole`.
 *
 * @example
 * percentOf(25, 200); // 50
 */
export function percentOf(percent: number, whole: number): number {
  assertFinite("percent", percent);
  assertFinite("whole", whole);
  return (percent / 100) * whole;
}

/**
 * Product of a list of finite numbers. An empty list yields `1`.
 *
 * @example
 * product([2, 3, 4]); // 24
 */
export function product(values: readonly number[]): number {
  let total = 1;
  for (const value of values) {
    assertFinite("value", value);
    total *= value;
  }
  return total;
}

/**
 * Hermite smoothstep between `edge0` and `edge1`.
 *
 * @example
 * smoothstep(0, 1, 0.5); // 0.5
 */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  assertFinite("edge0", edge0);
  assertFinite("edge1", edge1);
  assertFinite("value", value);
  if (edge0 === edge1) {
    throw new RangeError("edges must differ");
  }
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Snap `value` to the nearest multiple of `step`.
 *
 * @example
 * snap(7, 5); // 5
 * snap(8, 5); // 10
 */
export function snap(value: number, step: number): number {
  assertFinite("value", value);
  assertFinite("step", step);
  if (step === 0) {
    throw new RangeError("step must be non-zero");
  }
  return Math.round(value / step) * step;
}

/**
 * Sum of the decimal digits of an integer. The sign is ignored.
 *
 * @example
 * sumOfDigits(-195); // 15
 */
export function sumOfDigits(n: number): number {
  if (!Number.isInteger(n)) {
    throw new RangeError("n must be an integer");
  }
  const digits = Math.abs(n).toString();
  let total = 0;
  for (const digit of digits) {
    total += Number(digit);
  }
  return total;
}

/**
 * Whether `n` is a perfect square of a safe integer.
 *
 * @example
 * isPerfectSquare(16); // true
 * isPerfectSquare(15); // false
 */
export function isPerfectSquare(n: number): boolean {
  if (!Number.isInteger(n)) {
    throw new RangeError("n must be an integer");
  }
  if (n < 0) {
    return false;
  }
  if (!Number.isSafeInteger(n)) {
    throw new RangeError("n must be a safe integer");
  }
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
}

/**
 * Smallest prime strictly greater than `n`.
 *
 * @example
 * nextPrime(14); // 17
 */
export function nextPrime(n: number): number {
  if (!Number.isInteger(n)) {
    throw new RangeError("n must be an integer");
  }
  let candidate = n < 2 ? 2 : n + 1;
  if (candidate % 2 === 0 && candidate !== 2) {
    candidate += 1;
  }
  while (!isPrime(candidate)) {
    if (candidate >= Number.MAX_SAFE_INTEGER - 1) {
      throw new RangeError("next prime exceeds Number.MAX_SAFE_INTEGER");
    }
    candidate += candidate === 2 ? 1 : 2;
  }
  return candidate;
}

/**
 * Population variance of a non-empty list.
 *
 * @example
 * variance([2, 4, 4, 4, 5, 5, 7, 9]); // 4
 */
export function variance(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("variance requires at least one value");
  }
  const average = mean(values);
  let total = 0;
  for (const value of values) {
    const delta = value - average;
    total += delta * delta;
  }
  return total / values.length;
}
