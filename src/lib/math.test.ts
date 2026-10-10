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

describe("clamp", () => {
  it("limits a value to a range", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(4, 0, 10)).toBe(4);
  });
  it("rejects non-finite input", () => {
    expect(() => clamp(Number.POSITIVE_INFINITY, 0, 1)).toThrow(RangeError);
  });
});

describe("lerp", () => {
  it("interpolates", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 2)).toBe(20);
  });
});

describe("roundTo", () => {
  it("rounds to the requested digits", () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(1.234, 0)).toBe(1);
  });
});

describe("gcd", () => {
  it("returns the greatest common divisor", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(-8, 12)).toBe(4);
  });
});

describe("lcm", () => {
  it("returns the least common multiple", () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(0, 5)).toBe(0);
  });
});

describe("isPrime", () => {
  it("detects primes", () => {
    expect(isPrime(17)).toBe(true);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(4)).toBe(false);
    expect(isPrime(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
  });
});

describe("factorial", () => {
  it("computes small factorials", () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(5)).toBe(120);
  });
});

describe("fibonacci", () => {
  it("returns the nth fibonacci number", () => {
    expect(fibonacci(0)).toBe(0);
    expect(fibonacci(1)).toBe(1);
    expect(fibonacci(10)).toBe(55);
  });
});

describe("sum", () => {
  it("adds numbers", () => {
    expect(sum([1, 2, 3])).toBe(6);
    expect(sum([])).toBe(0);
  });
});

describe("mean", () => {
  it("averages numbers", () => {
    expect(mean([2, 4, 6])).toBe(4);
  });
});

describe("median", () => {
  it("finds the middle", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
});

describe("clamp01", () => {
  it("clamps to the unit interval", () => {
    expect(clamp01(1.4)).toBe(1);
    expect(clamp01(-0.2)).toBe(0);
  });
});

describe("inverseLerp", () => {
  it("recovers the interpolation factor", () => {
    expect(inverseLerp(0, 10, 5)).toBe(0.5);
  });
});

describe("remap", () => {
  it("maps between ranges", () => {
    expect(remap(5, 0, 10, 0, 100)).toBe(50);
  });
});

describe("mod", () => {
  it("returns a non-negative remainder", () => {
    expect(mod(-1, 5)).toBe(4);
    expect(mod(7, 5)).toBe(2);
  });
});

describe("degToRad", () => {
  it("converts degrees", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
  });
});

describe("radToDeg", () => {
  it("converts radians", () => {
    expect(radToDeg(Math.PI)).toBeCloseTo(180);
  });
});

describe("isEven", () => {
  it("detects even integers", () => {
    expect(isEven(4)).toBe(true);
    expect(isEven(3)).toBe(false);
  });
});

describe("isOdd", () => {
  it("detects odd integers", () => {
    expect(isOdd(3)).toBe(true);
    expect(isOdd(-2)).toBe(false);
  });
});

describe("hypot", () => {
  it("computes vector length", () => {
    expect(hypot(3, 4)).toBe(5);
    expect(hypot()).toBe(0);
  });
});

describe("distance", () => {
  it("computes point distance", () => {
    expect(distance([0, 0], [3, 4])).toBe(5);
    expect(distance([], [])).toBe(0);
  });
});

describe("approximatelyEqual", () => {
  it("compares within epsilon", () => {
    expect(approximatelyEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(approximatelyEqual(1, 2)).toBe(false);
  });
});

describe("percentOf", () => {
  it("computes a percentage", () => {
    expect(percentOf(25, 200)).toBe(50);
  });
});

describe("product", () => {
  it("multiplies numbers", () => {
    expect(product([2, 3, 4])).toBe(24);
    expect(product([])).toBe(1);
  });
});

describe("smoothstep", () => {
  it("eases between edges", () => {
    expect(smoothstep(0, 1, 0)).toBe(0);
    expect(smoothstep(0, 1, 1)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBe(0.5);
  });
});

describe("snap", () => {
  it("snaps to a step", () => {
    expect(snap(11, 5)).toBe(10);
  });
});

describe("sumOfDigits", () => {
  it("adds digits", () => {
    expect(sumOfDigits(-19)).toBe(10);
  });
});

describe("isPerfectSquare", () => {
  it("detects squares", () => {
    expect(isPerfectSquare(16)).toBe(true);
    expect(isPerfectSquare(15)).toBe(false);
    expect(isPerfectSquare(Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});

describe("nextPrime", () => {
  it("returns the following prime", () => {
    expect(nextPrime(14)).toBe(17);
    expect(nextPrime(2)).toBe(3);
  });
});

describe("variance", () => {
  it("computes population variance", () => {
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBe(4);
  });
});
