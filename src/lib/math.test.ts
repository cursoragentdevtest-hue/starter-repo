import { describe, expect, it } from "vitest";
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

describe("math", () => {
  it("clamp", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(() => clamp(1, 2, 1)).toThrow(RangeError);
  });

  it("lerp", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it("roundTo", () => {
    expect(roundTo(1.2345, 2)).toBe(1.23);
  });

  it("gcd", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(-12, 18)).toBe(6);
  });

  it("lcm", () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(0, 5)).toBe(0);
  });

  it("isPrime", () => {
    expect(isPrime(17)).toBe(true);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(9)).toBe(false);
  });

  it("factorial", () => {
    expect(factorial(5)).toBe(120);
    expect(factorial(0)).toBe(1);
  });

  it("fibonacci", () => {
    expect(fibonacci(10)).toBe(55);
    expect(fibonacci(0)).toBe(0);
  });

  it("sum", () => {
    expect(sum([1, 2, 3])).toBe(6);
    expect(sum([])).toBe(0);
  });

  it("mean", () => {
    expect(mean([2, 4, 6])).toBe(4);
    expect(() => mean([])).toThrow(RangeError);
  });

  it("median", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it("clamp01", () => {
    expect(clamp01(1.4)).toBe(1);
    expect(clamp01(-0.2)).toBe(0);
  });

  it("inverseLerp", () => {
    expect(inverseLerp(0, 10, 5)).toBe(0.5);
  });

  it("remap", () => {
    expect(remap(5, 0, 10, 0, 100)).toBe(50);
  });

  it("mod", () => {
    expect(mod(-1, 5)).toBe(4);
    expect(() => mod(1, 0)).toThrow(RangeError);
  });

  it("degToRad", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
  });

  it("radToDeg", () => {
    expect(radToDeg(Math.PI)).toBeCloseTo(180);
  });

  it("isEven", () => {
    expect(isEven(4)).toBe(true);
    expect(isEven(3)).toBe(false);
  });

  it("isOdd", () => {
    expect(isOdd(3)).toBe(true);
  });

  it("hypot", () => {
    expect(hypot(3, 4)).toBe(5);
  });

  it("distance", () => {
    expect(distance([0, 0], [3, 4])).toBe(5);
  });

  it("approximatelyEqual", () => {
    expect(approximatelyEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(approximatelyEqual(1, 2)).toBe(false);
  });

  it("percentOf", () => {
    expect(percentOf(25, 200)).toBe(50);
  });

  it("product", () => {
    expect(product([2, 3, 4])).toBe(24);
    expect(product([])).toBe(1);
  });

  it("smoothstep", () => {
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5);
  });

  it("snap", () => {
    expect(snap(7, 5)).toBe(5);
    expect(snap(8, 5)).toBe(10);
  });

  it("sumOfDigits", () => {
    expect(sumOfDigits(-195)).toBe(15);
  });

  it("isPerfectSquare", () => {
    expect(isPerfectSquare(16)).toBe(true);
    expect(isPerfectSquare(15)).toBe(false);
    expect(isPerfectSquare(-4)).toBe(false);
  });

  it("nextPrime", () => {
    expect(nextPrime(14)).toBe(17);
    expect(nextPrime(2)).toBe(3);
  });

  it("variance", () => {
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBe(4);
  });
});
