import { describe, expect, it } from "vitest";
import {
  approximatelyEqual,
  clamp,
  combinations,
  degToRad,
  factorial,
  fibonacci,
  floorDiv,
  gcd,
  inverseLerp,
  isPerfectSquare,
  isPrime,
  lcm,
  lerp,
  mapRange,
  max,
  mean,
  median,
  min,
  mod,
  nextPrime,
  normalizeDegrees,
  percentChange,
  product,
  radToDeg,
  roundTo,
  sign,
  stddev,
  sum,
  sumOfDigits,
  variance,
} from "./math";

describe("clamp", () => {
  it("restricts a value to a range", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(4, 0, 10)).toBe(4);
  });

  it("rejects an inverted range", () => {
    expect(() => clamp(1, 5, 1)).toThrow(RangeError);
  });
});

describe("lerp", () => {
  it("interpolates and extrapolates", () => {
    expect(lerp(0, 100, 0.25)).toBe(25);
    expect(lerp(10, 20, 1.5)).toBe(25);
  });
});

describe("inverseLerp", () => {
  it("returns the relative position", () => {
    expect(inverseLerp(0, 100, 25)).toBe(0.25);
    expect(inverseLerp(10, 20, 15)).toBe(0.5);
  });

  it("rejects a zero-width range", () => {
    expect(() => inverseLerp(1, 1, 1)).toThrow(RangeError);
  });
});

describe("mapRange", () => {
  it("maps between ranges", () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
    expect(mapRange(0, 0, 10, 20, 40)).toBe(20);
  });
});

describe("roundTo", () => {
  it("rounds to the requested digits", () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(1.2345, 0)).toBe(1);
  });

  it("rejects a bad digit count", () => {
    expect(() => roundTo(1, -1)).toThrow(RangeError);
  });
});

describe("gcd", () => {
  it("returns the greatest common divisor", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(-8, 12)).toBe(4);
    expect(gcd(0, 5)).toBe(5);
  });

  it("rejects non-finite integers", () => {
    expect(() => gcd(Infinity, 2)).toThrow(RangeError);
  });
});

describe("lcm", () => {
  it("returns the least common multiple", () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(0, 5)).toBe(0);
  });

  it("rejects non-finite integers", () => {
    expect(() => lcm(NaN, 2)).toThrow(RangeError);
  });
});

describe("isPrime", () => {
  it("detects primes", () => {
    expect(isPrime(17)).toBe(true);
    expect(isPrime(2)).toBe(true);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(9)).toBe(false);
  });
});

describe("factorial", () => {
  it("computes n!", () => {
    expect(factorial(5)).toBe(120);
    expect(factorial(0)).toBe(1);
  });

  it("rejects negatives", () => {
    expect(() => factorial(-1)).toThrow(RangeError);
  });
});

describe("combinations", () => {
  it("counts subsets", () => {
    expect(combinations(5, 2)).toBe(10);
    expect(combinations(4, 0)).toBe(1);
    expect(combinations(3, 5)).toBe(0);
  });
});

describe("sum", () => {
  it("adds numbers", () => {
    expect(sum([1, 2, 3, 4])).toBe(10);
    expect(sum([])).toBe(0);
  });
});

describe("mean", () => {
  it("averages numbers", () => {
    expect(mean([2, 4, 6])).toBe(4);
    expect(mean([1, 2])).toBe(1.5);
  });

  it("rejects an empty list", () => {
    expect(() => mean([])).toThrow(RangeError);
  });
});

describe("median", () => {
  it("finds the middle value", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
});

describe("variance", () => {
  it("computes population variance", () => {
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBe(4);
    expect(variance([1, 1, 1])).toBe(0);
  });
});

describe("stddev", () => {
  it("computes population standard deviation", () => {
    expect(stddev([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2);
    expect(stddev([5, 5, 5])).toBe(0);
  });
});

describe("min", () => {
  it("returns the smallest value", () => {
    expect(min([3, 1, 2])).toBe(1);
    expect(min([-5, -1, -8])).toBe(-8);
  });
});

describe("max", () => {
  it("returns the largest value", () => {
    expect(max([3, 1, 2])).toBe(3);
    expect(max([-5, -1, -8])).toBe(-1);
  });
});

describe("mod", () => {
  it("wraps into a positive remainder", () => {
    expect(mod(-1, 5)).toBe(4);
    expect(mod(7, 5)).toBe(2);
  });

  it("rejects a non-positive modulus", () => {
    expect(() => mod(1, 0)).toThrow(RangeError);
  });

  it("rejects non-finite input", () => {
    expect(() => mod(Infinity, 5)).toThrow(RangeError);
  });
});

describe("floorDiv", () => {
  it("divides toward negative infinity", () => {
    expect(floorDiv(-7, 3)).toBe(-3);
    expect(floorDiv(7, 3)).toBe(2);
  });
});

describe("sign", () => {
  it("returns -1, 0, or 1", () => {
    expect(sign(-4)).toBe(-1);
    expect(sign(0)).toBe(0);
    expect(sign(8)).toBe(1);
  });
});

describe("approximatelyEqual", () => {
  it("compares within a tolerance", () => {
    expect(approximatelyEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(approximatelyEqual(1, 1.01, 0.001)).toBe(false);
  });
});

describe("isPerfectSquare", () => {
  it("detects perfect squares", () => {
    expect(isPerfectSquare(16)).toBe(true);
    expect(isPerfectSquare(15)).toBe(false);
    expect(isPerfectSquare(-4)).toBe(false);
    expect(isPerfectSquare(Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});

describe("sumOfDigits", () => {
  it("adds decimal digits", () => {
    expect(sumOfDigits(-123)).toBe(6);
    expect(sumOfDigits(0)).toBe(0);
  });

  it("rejects non-finite input", () => {
    expect(() => sumOfDigits(Infinity)).toThrow(RangeError);
  });
});

describe("fibonacci", () => {
  it("returns the nth Fibonacci number", () => {
    expect(fibonacci(10)).toBe(55);
    expect(fibonacci(0)).toBe(0);
    expect(fibonacci(1)).toBe(1);
  });
});

describe("degToRad", () => {
  it("converts degrees to radians", () => {
    expect(degToRad(180)).toBe(Math.PI);
    expect(degToRad(0)).toBe(0);
  });
});

describe("radToDeg", () => {
  it("converts radians to degrees", () => {
    expect(radToDeg(Math.PI)).toBe(180);
    expect(radToDeg(0)).toBe(0);
  });
});

describe("normalizeDegrees", () => {
  it("wraps angles into [0, 360)", () => {
    expect(normalizeDegrees(-90)).toBe(270);
    expect(normalizeDegrees(360)).toBe(0);
  });
});

describe("nextPrime", () => {
  it("returns the following prime", () => {
    expect(nextPrime(14)).toBe(17);
    expect(nextPrime(2)).toBe(3);
  });

  it("rejects non-finite input", () => {
    expect(() => nextPrime(Infinity)).toThrow(RangeError);
  });
});

describe("product", () => {
  it("multiplies numbers", () => {
    expect(product([2, 3, 4])).toBe(24);
    expect(product([])).toBe(1);
  });
});

describe("percentChange", () => {
  it("measures relative change", () => {
    expect(percentChange(50, 75)).toBe(50);
    expect(percentChange(80, 60)).toBe(-25);
  });

  it("rejects a zero baseline", () => {
    expect(() => percentChange(0, 1)).toThrow(RangeError);
  });
});
