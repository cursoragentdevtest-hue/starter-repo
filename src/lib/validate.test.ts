import { describe, expect, it } from "vitest";
import {
  assertFunction,
  assertInteger,
  assertPlainObject,
  assertPositiveInteger,
  assertStringArray,
  describeValue,
} from "./validate";

describe("describeValue", () => {
  it("labels awkward values clearly", () => {
    expect(describeValue("x")).toBe('"x"');
    expect(describeValue(Number.NaN)).toBe("NaN");
    expect(describeValue(null)).toBe("null");
    expect(describeValue(undefined)).toBe("undefined");
    expect(describeValue([1, 2])).toBe("array(length 2)");
    expect(describeValue(() => 0)).toBe("function");
  });
});

describe("assert helpers", () => {
  it("throws named errors for each public assertion", () => {
    expect(() => assertInteger("fn", "n", 1.5)).toThrow('fn: "n" must be an integer, received 1.5');
    expect(() => assertPositiveInteger("fn", "n", 0)).toThrow(
      'fn: "n" must be a positive integer, received 0',
    );
    expect(() => assertFunction("fn", "cb", undefined)).toThrow(
      'fn: "cb" must be a function, received undefined',
    );
    expect(() => assertStringArray("fn", "argv", { length: 1 })).toThrow(
      'fn: "argv" must be an array of strings, received object',
    );
    expect(() => assertStringArray("fn", "argv", [1])).toThrow(
      'fn: "argv[0]" must be a string, received 1',
    );
    expect(() => assertPlainObject("fn", "io", null)).toThrow(
      'fn: "io" must be an object, received null',
    );
    expect(() => assertPlainObject("fn", "io", [])).toThrow(
      'fn: "io" must be an object, received array(length 0)',
    );
  });
});
