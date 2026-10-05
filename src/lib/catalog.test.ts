import { describe, expect, it } from "vitest";
import {
  FACTS,
  QUACKS,
  getFact,
  getQuack,
  pickFact,
  pickQuack,
} from "./catalog";

describe("catalog helpers", () => {
  it("pickQuack uses the provided random source", () => {
    expect(pickQuack(() => 0)).toBe(QUACKS[0]);
    expect(pickQuack(() => 0.999)).toBe(QUACKS[QUACKS.length - 1]);
  });

  it("pickFact uses the provided random source", () => {
    expect(pickFact(() => 0)).toBe(FACTS[0]);
    expect(pickFact(() => 0.999)).toBe(FACTS[FACTS.length - 1]);
  });

  it("getQuack and getFact reject invalid indexes", () => {
    expect(() => getQuack(-1)).toThrow(RangeError);
    expect(() => getFact(FACTS.length)).toThrow(RangeError);
  });
});

describe("catalog error paths", () => {
  it("pickQuack rejects a non-function random source", () => {
    expect(() => pickQuack("nope" as unknown as () => number)).toThrow(
      /pickQuack\(random\): random must be a function/,
    );
  });

  it("pickFact rejects a non-function random source", () => {
    expect(() => pickFact(null as unknown as () => number)).toThrow(
      /pickFact\(random\): random must be a function/,
    );
  });

  it("pickQuack rejects random values outside [0, 1)", () => {
    expect(() => pickQuack(() => 1)).toThrow(
      /pickQuack\(random\): random\(\) must return a number in \[0, 1\)/,
    );
    expect(() => pickQuack(() => -0.1)).toThrow(RangeError);
    expect(() => pickQuack(() => Number.NaN)).toThrow(RangeError);
  });

  it("pickFact rejects random values that are not numbers", () => {
    expect(() =>
      pickFact((() => "0.5") as unknown as () => number),
    ).toThrow(/pickFact\(random\): random\(\) must return a number in \[0, 1\)/);
  });

  it("getQuack rejects non-number indexes with a TypeError", () => {
    expect(() => getQuack("0" as unknown as number)).toThrow(TypeError);
    expect(() => getQuack("0" as unknown as number)).toThrow(
      /Quack index must be a number \(got string "0"\)/,
    );
  });

  it("getFact rejects non-integer indexes with a clear RangeError", () => {
    expect(() => getFact(1.5)).toThrow(RangeError);
    expect(() => getFact(1.5)).toThrow(/Fact index must be an integer \(got 1\.5\)/);
  });

  it("getQuack rejects out-of-range indexes with bounds in the message", () => {
    expect(() => getQuack(99)).toThrow(
      `Quack index out of range: expected 0..${QUACKS.length - 1}, got 99`,
    );
  });

  it("getFact rejects negative indexes with bounds in the message", () => {
    expect(() => getFact(-1)).toThrow(
      `Fact index out of range: expected 0..${FACTS.length - 1}, got -1`,
    );
  });
});
