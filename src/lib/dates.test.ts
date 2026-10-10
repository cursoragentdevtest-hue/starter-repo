import { expect, it } from "vitest";
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

function utc(year: number, monthIndex: number, day: number, hours = 0, minutes = 0): Date {
  return new Date(Date.UTC(year, monthIndex, day, hours, minutes));
}

it("adds integer days", () => {
  expect(addDays(utc(2024, 0, 31), 1).toISOString()).toBe("2024-02-01T00:00:00.000Z");
  expect(() => addDays(utc(2024, 0, 1), 1.5)).toThrow(RangeError);
});

it("adds finite hours", () => {
  expect(addHours(utc(2024, 0, 1), 1.5).toISOString()).toBe("2024-01-01T01:30:00.000Z");
  expect(() => addHours(utc(2024, 0, 1), Number.NaN)).toThrow(RangeError);
});

it("adds finite minutes", () => {
  expect(addMinutes(utc(2024, 0, 1), 90).toISOString()).toBe("2024-01-01T01:30:00.000Z");
  expect(addMinutes(utc(2024, 0, 1), 0.5).toISOString()).toBe("2024-01-01T00:00:30.000Z");
});

it("adds months and clamps the day", () => {
  expect(addMonths(utc(2024, 0, 31, 15, 30), 1).toISOString()).toBe("2024-02-29T15:30:00.000Z");
  expect(addMonths(utc(2024, 2, 31), -1).toISOString()).toBe("2024-02-29T00:00:00.000Z");
  expect(() => addMonths(utc(2024, 0, 1), 1.2)).toThrow(RangeError);
});

it("returns UTC midnight", () => {
  expect(startOfDay(utc(2024, 5, 15, 18)).toISOString()).toBe("2024-06-15T00:00:00.000Z");
});

it("returns the last millisecond of the UTC day", () => {
  expect(endOfDay(utc(2024, 5, 15)).toISOString()).toBe("2024-06-15T23:59:59.999Z");
});

it("returns the first UTC midnight of the month", () => {
  expect(startOfMonth(utc(2024, 5, 15, 12)).toISOString()).toBe("2024-06-01T00:00:00.000Z");
});

it("returns the last millisecond of the month", () => {
  expect(endOfMonth(utc(2024, 1, 10)).toISOString()).toBe("2024-02-29T23:59:59.999Z");
  expect(endOfMonth(utc(2023, 1, 10)).toISOString()).toBe("2023-02-28T23:59:59.999Z");
});

it("compares UTC calendar days", () => {
  expect(isSameDay(utc(2024, 0, 1), utc(2024, 0, 1, 23))).toBe(true);
  expect(isSameDay(utc(2024, 0, 1), utc(2024, 0, 2))).toBe(false);
});

it("detects leap years", () => {
  expect(isLeapYear(2024)).toBe(true);
  expect(isLeapYear(1900)).toBe(false);
  expect(isLeapYear(2000)).toBe(true);
});

it("counts days in a month, including year 4", () => {
  expect(daysInMonth(4, 2)).toBe(29);
  expect(daysInMonth(2023, 2)).toBe(28);
  expect(daysInMonth(2024, 1)).toBe(31);
  expect(() => daysInMonth(2024, 13)).toThrow(RangeError);
});

it("formats a UTC date with a four-digit year", () => {
  expect(formatISODate(utc(2024, 1, 3, 15))).toBe("2024-02-03");
  expect(formatISODate(parseISODate("0004-02-29"))).toBe("0004-02-29");
});

it("formats elapsed time relative to now", () => {
  const now = utc(2024, 0, 1);
  expect(formatRelative(new Date(now.getTime() + 1000), now)).toBe("just now");
  expect(formatRelative(new Date(now.getTime() - 10_000), now)).toBe("10 seconds ago");
  expect(formatRelative(new Date(now.getTime() + 60_000), now)).toBe("in 1 minute");
  expect(formatRelative(new Date(now.getTime() - 3_600_000), now)).toBe("1 hour ago");
  expect(formatRelative(new Date(now.getTime() - 8 * 86_400_000), now)).toBe("1 week ago");
});

it("counts UTC calendar days from earlier to later", () => {
  expect(diffDays(utc(2024, 0, 3), utc(2024, 0, 1, 23))).toBe(2);
  expect(diffDays(utc(2024, 0, 1), utc(2024, 0, 3))).toBe(-2);
});

it("detects Saturday and Sunday in UTC", () => {
  expect(isWeekend(utc(2024, 0, 6))).toBe(true);
  expect(isWeekend(utc(2024, 0, 7))).toBe(true);
  expect(isWeekend(utc(2024, 0, 8))).toBe(false);
});

it("clamps a date and returns a copy", () => {
  const min = utc(2024, 1, 1);
  const max = utc(2024, 2, 1);
  const early = utc(2024, 0, 1);
  expect(clampDate(early, min, max).toISOString()).toBe(min.toISOString());
  expect(clampDate(early, max, min).toISOString()).toBe(min.toISOString());
  const inside = utc(2024, 1, 15);
  const clamped = clampDate(inside, min, max);
  expect(clamped).not.toBe(inside);
  expect(clamped.toISOString()).toBe(inside.toISOString());
});

it("parses a real YYYY-MM-DD day, including year 4", () => {
  expect(parseISODate("0004-02-29").toISOString()).toBe("0004-02-29T00:00:00.000Z");
  expect(parseISODate("2024-01-31").toISOString()).toBe("2024-01-31T00:00:00.000Z");
  expect(() => parseISODate("2024-02-30")).toThrow(RangeError);
  expect(() => parseISODate("2024-1-01")).toThrow(RangeError);
});

it("returns a copy of the earliest date", () => {
  const early = utc(2024, 0, 1);
  const later = utc(2024, 1, 1);
  const result = minDate([later, early]);
  expect(result.toISOString()).toBe(early.toISOString());
  expect(result).not.toBe(early);
  expect(() => minDate([])).toThrow(RangeError);
});

it("returns a copy of the latest date", () => {
  const early = utc(2024, 0, 1);
  const later = utc(2024, 1, 1);
  expect(maxDate([early, later]).toISOString()).toBe(later.toISOString());
  expect(() => maxDate([])).toThrow(RangeError);
});

it("guards valid dates and rejects other values", () => {
  expect(isValidDate(utc(2024, 0, 1))).toBe(true);
  expect(isValidDate(new Date("nope"))).toBe(false);
  expect(isValidDate("2024-01-01")).toBe(false);
});
