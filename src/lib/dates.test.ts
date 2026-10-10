import { describe, expect, it } from "vitest";
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  clampDate,
  daysInMonth,
  diffDays,
  endOfDay,
  endOfMonth,
  formatISODate,
  formatRelative,
  isLeapYear,
  isSameDay,
  isValidDate,
  isWeekend,
  maxDate,
  minDate,
  parseISODate,
  startOfDay,
  startOfMonth,
} from "./dates";

const day = (iso: string) => new Date(iso);

describe("dates", () => {
  it("addDays", () => {
    expect(addDays(day("2020-01-01T00:00:00.000Z"), 1).toISOString()).toBe("2020-01-02T00:00:00.000Z");
  });

  it("addHours", () => {
    expect(addHours(day("2020-01-01T00:00:00.000Z"), 3).toISOString()).toBe("2020-01-01T03:00:00.000Z");
  });

  it("addMinutes", () => {
    expect(addMinutes(day("2020-01-01T00:00:00.000Z"), 30).toISOString()).toBe("2020-01-01T00:30:00.000Z");
  });

  it("addMonths", () => {
    expect(addMonths(day("2020-01-31T00:00:00.000Z"), 1).toISOString()).toBe("2020-02-29T00:00:00.000Z");
  });

  it("startOfDay", () => {
    expect(startOfDay(day("2020-06-15T13:45:00.000Z")).toISOString()).toBe("2020-06-15T00:00:00.000Z");
  });

  it("endOfDay", () => {
    expect(endOfDay(day("2020-06-15T13:45:00.000Z")).toISOString()).toBe("2020-06-15T23:59:59.999Z");
  });

  it("startOfMonth", () => {
    expect(startOfMonth(day("2020-06-15T00:00:00.000Z")).toISOString()).toBe("2020-06-01T00:00:00.000Z");
  });

  it("endOfMonth", () => {
    expect(endOfMonth(day("2020-02-01T00:00:00.000Z")).toISOString()).toBe("2020-02-29T23:59:59.999Z");
  });

  it("isSameDay", () => {
    expect(isSameDay(day("2020-01-01T01:00:00.000Z"), day("2020-01-01T23:00:00.000Z"))).toBe(true);
    expect(isSameDay(day("2020-01-01T00:00:00.000Z"), day("2020-01-02T00:00:00.000Z"))).toBe(false);
  });

  it("isLeapYear", () => {
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });

  it("daysInMonth", () => {
    expect(daysInMonth(2020, 2)).toBe(29);
    expect(daysInMonth(2021, 2)).toBe(28);
  });

  it("formatISODate", () => {
    expect(formatISODate(day("2020-06-05T12:00:00.000Z"))).toBe("2020-06-05");
  });

  it("formatRelative", () => {
    expect(formatRelative(day("2020-01-03T00:00:00.000Z"), day("2020-01-01T00:00:00.000Z"))).toBe("in 2 days");
  });

  it("diffDays", () => {
    expect(diffDays(day("2020-01-01T00:00:00.000Z"), day("2020-01-03T00:00:00.000Z"))).toBe(2);
  });

  it("isWeekend", () => {
    expect(isWeekend(day("2020-01-04T00:00:00.000Z"))).toBe(true);
    expect(isWeekend(day("2020-01-06T00:00:00.000Z"))).toBe(false);
  });

  it("clampDate", () => {
    expect(
      clampDate(day("2020-01-05T00:00:00.000Z"), day("2020-01-01T00:00:00.000Z"), day("2020-01-02T00:00:00.000Z")).toISOString(),
    ).toBe("2020-01-02T00:00:00.000Z");
  });

  it("parseISODate", () => {
    expect(parseISODate("2020-01-02").toISOString()).toBe("2020-01-02T00:00:00.000Z");
    expect(() => parseISODate("2020-02-31")).toThrow(RangeError);
  });

  it("minDate", () => {
    expect(minDate([day("2020-01-02T00:00:00.000Z"), day("2020-01-01T00:00:00.000Z")]).toISOString()).toBe(
      "2020-01-01T00:00:00.000Z",
    );
  });

  it("maxDate", () => {
    expect(maxDate([day("2020-01-02T00:00:00.000Z"), day("2020-01-01T00:00:00.000Z")]).toISOString()).toBe(
      "2020-01-02T00:00:00.000Z",
    );
  });

  it("isValidDate", () => {
    expect(isValidDate(day("2020-01-01T00:00:00.000Z"))).toBe(true);
    expect(isValidDate(new Date("nope"))).toBe(false);
  });
});
