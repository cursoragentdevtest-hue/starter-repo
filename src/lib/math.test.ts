import { expect, it } from "vitest";
import {
  approximatelyEqual,
  clamp,
  clamp01,
  degToRad,
  distance,
  factorial,
  fibonacci,
  gcd,
  hypot,
  inverseLerp,
  isEven,
  isOdd,
  isPerfectSquare,
  isPrime,
  lcm,
  lerp,
  mean,
  median,
  mod,
  nextPrime,
  percentOf,
  product,
  radToDeg,
  remap,
  roundTo,
  smoothstep,
  snap,
  sum,
  sumOfDigits,
  variance,
} from "./math";

it("clamps into the interval and swaps reversed bounds", () => {
  expect(clamp(5, 0, 10)).toBe(5);
  expect(clamp(-1, 10, 0)).toBe(0);
  expect(clamp(12, 0, 10)).toBe(10);
});

it("interpolates and extrapolates", () => {
  expect(lerp(0, 10, 0.5)).toBe(5);
  expect(lerp(10, 20, 0)).toBe(10);
  expect(lerp(0, 10, 2)).toBe(20);
});

it("rounds with Math.round, so halves move toward +infinity", () => {
  expect(roundTo(3.14159, 2)).toBe(3.14);
  expect(roundTo(2.5, 0)).toBe(3);
  expect(roundTo(Math.PI, 4)).toBe(3.1416);
  expect(roundTo(-1.5, 0)).toBe(-1);
  expect(() => roundTo(1, -1)).toThrow(RangeError);
});

it("computes a sign-insensitive truncated gcd and rejects non-finite input", () => {
  expect(gcd(12, 18)).toBe(6);
  expect(gcd(-4, 6)).toBe(2);
  expect(gcd(4.9, 2)).toBe(2);
  expect(() => gcd(Infinity, 1)).toThrow(RangeError);
});

it("computes lcm and rejects non-finite input", () => {
  expect(lcm(4, 6)).toBe(12);
  expect(lcm(0, 5)).toBe(0);
  expect(() => lcm(NaN, 2)).toThrow(RangeError);
});

it("recognizes primes and rejects non-integers", () => {
  expect(isPrime(2)).toBe(true);
  expect(isPrime(4)).toBe(false);
  expect(isPrime(4.0)).toBe(false);
  expect(isPrime(4.5)).toBe(false);
  expect(isPrime(1)).toBe(false);
});

it("computes factorial for non-negative integers", () => {
  expect(factorial(0)).toBe(1);
  expect(factorial(5)).toBe(120);
  expect(() => factorial(-1)).toThrow(RangeError);
  expect(() => factorial(1.5)).toThrow(RangeError);
});

it("computes fibonacci for non-negative integers", () => {
  expect(fibonacci(0)).toBe(0);
  expect(fibonacci(1)).toBe(1);
  expect(fibonacci(6)).toBe(8);
  expect(() => fibonacci(-2)).toThrow(RangeError);
});

it("sums numbers", () => {
  expect(sum([1, 2, 3])).toBe(6);
  expect(sum([])).toBe(0);
});

it("averages numbers and rejects an empty list", () => {
  expect(mean([2, 4, 6])).toBe(4);
  expect(mean([1, 2])).toBe(1.5);
  expect(() => mean([])).toThrow(RangeError);
});

it("finds the median without mutating the input", () => {
  const values = [1, 3, 2];
  expect(median(values)).toBe(2);
  expect(values).toEqual([1, 3, 2]);
  expect(median([1, 2, 3, 4])).toBe(2.5);
  expect(() => median([])).toThrow(RangeError);
});

it("clamps to the unit interval", () => {
  expect(clamp01(2)).toBe(1);
  expect(clamp01(-0.2)).toBe(0);
  expect(clamp01(0.4)).toBe(0.4);
});

it("inverts a lerp", () => {
  expect(inverseLerp(0, 10, 5)).toBe(0.5);
  expect(inverseLerp(2, 2, 9)).toBe(0);
});

it("remaps a value between ranges", () => {
  expect(remap(5, 0, 10, 0, 100)).toBe(50);
  expect(remap(0, 0, 1, 10, 20)).toBe(10);
});

it("returns a non-negative remainder for a positive modulus", () => {
  expect(mod(5, 3)).toBe(2);
  expect(mod(-1, 3)).toBe(2);
  expect(() => mod(1, 0)).toThrow(RangeError);
  expect(() => mod(1, Infinity)).toThrow(RangeError);
  expect(() => mod(NaN, 2)).toThrow(RangeError);
});

it("converts degrees to radians", () => {
  expect(degToRad(180)).toBe(Math.PI);
  expect(degToRad(0)).toBe(0);
});

it("converts radians to degrees", () => {
  expect(radToDeg(Math.PI)).toBe(180);
  expect(radToDeg(0)).toBe(0);
});

it("detects even integers", () => {
  expect(isEven(4)).toBe(true);
  expect(isEven(4.0)).toBe(true);
  expect(isEven(4.5)).toBe(false);
  expect(isEven(-2)).toBe(true);
});

it("detects odd integers", () => {
  expect(isOdd(-3)).toBe(true);
  expect(isOdd(2)).toBe(false);
  expect(isOdd(2.5)).toBe(false);
});

it("measures a vector length", () => {
  expect(hypot(3, 4)).toBe(5);
  expect(hypot(0, 0)).toBe(0);
});

it("measures the distance between two points", () => {
  expect(distance(0, 0, 3, 4)).toBe(5);
  expect(distance(1, 1, 1, 1)).toBe(0);
});

it("compares numbers within an epsilon", () => {
  expect(approximatelyEqual(0.1 + 0.2, 0.3)).toBe(true);
  expect(approximatelyEqual(1, 1.1, 0.05)).toBe(false);
  expect(approximatelyEqual(1, 1 + 1e-12)).toBe(true);
});

it("expresses a part as a percentage", () => {
  expect(percentOf(1, 4)).toBe(25);
  expect(percentOf(3, 2)).toBe(150);
  expect(() => percentOf(1, 0)).toThrow(RangeError);
});

it("multiplies numbers", () => {
  expect(product([2, 3, 4])).toBe(24);
  expect(product([])).toBe(1);
});

it("applies smoothstep inside and outside the edges", () => {
  expect(smoothstep(0, 1, 0)).toBe(0);
  expect(smoothstep(0, 1, 1)).toBe(1);
  expect(smoothstep(0, 1, 0.5)).toBe(0.5);
  expect(smoothstep(0, 1, -2)).toBe(0);
});

it("snaps to a step and rejects a zero step", () => {
  expect(snap(5.1, 2)).toBe(6);
  expect(snap(4, 2)).toBe(4);
  expect(() => snap(2.5, 0)).toThrow(RangeError);
});

it("sums digits and rejects non-finite input", () => {
  expect(sumOfDigits(19)).toBe(10);
  expect(sumOfDigits(-10.9)).toBe(1);
  expect(() => sumOfDigits(Infinity)).toThrow(RangeError);
});

it("recognizes safe perfect squares", () => {
  expect(isPerfectSquare(49)).toBe(true);
  expect(isPerfectSquare(0)).toBe(true);
  expect(isPerfectSquare(2)).toBe(false);
  expect(isPerfectSquare(-4)).toBe(false);
  expect(isPerfectSquare(94_906_265 ** 2)).toBe(true);
  expect(isPerfectSquare(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
});

it("returns the following prime and rejects non-finite input", () => {
  expect(nextPrime(2)).toBe(3);
  expect(nextPrime(1)).toBe(2);
  expect(nextPrime(14)).toBe(17);
  expect(() => nextPrime(NaN)).toThrow(RangeError);
  expect(() => nextPrime(Number.MAX_SAFE_INTEGER)).toThrow(/no safe integer prime/);
});

it("computes population variance", () => {
  expect(variance([1, 2, 3])).toBeCloseTo(2 / 3);
  expect(variance([4, 4, 4])).toBe(0);
  expect(() => variance([])).toThrow(RangeError);
});
