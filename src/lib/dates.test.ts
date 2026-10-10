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

const day = parseISODate("2024-03-05");

describe("addDays", () => {
  it("adds utc days", () => {
    expect(formatISODate(addDays(day, 1))).toBe("2024-03-06");
  });
});

describe("addHours", () => {
  it("adds hours", () => {
    expect(addHours(day, 3).toISOString()).toBe("2024-03-05T03:00:00.000Z");
  });
});

describe("addMinutes", () => {
  it("adds minutes", () => {
    expect(addMinutes(day, 15).toISOString()).toBe("2024-03-05T00:15:00.000Z");
  });
});

describe("addMonths", () => {
  it("clamps the day to the target month", () => {
    expect(formatISODate(addMonths(parseISODate("2024-01-31"), 1))).toBe("2024-02-29");
  });
});

describe("startOfDay", () => {
  it("returns utc midnight", () => {
    expect(startOfDay(addHours(day, 5)).toISOString()).toBe("2024-03-05T00:00:00.000Z");
  });
});

describe("endOfDay", () => {
  it("returns the last utc millisecond", () => {
    expect(endOfDay(day).toISOString()).toBe("2024-03-05T23:59:59.999Z");
  });
});

describe("startOfMonth", () => {
  it("returns the first of the month", () => {
    expect(formatISODate(startOfMonth(day))).toBe("2024-03-01");
  });
});

describe("endOfMonth", () => {
  it("returns the last of the month", () => {
    expect(formatISODate(endOfMonth(day))).toBe("2024-03-31");
  });
});

describe("isSameDay", () => {
  it("compares the utc calendar day", () => {
    expect(isSameDay(day, addHours(day, 20))).toBe(true);
    expect(isSameDay(day, addDays(day, 1))).toBe(false);
  });
});

describe("isLeapYear", () => {
  it("follows the gregorian rule", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe("daysInMonth", () => {
  it("counts february", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
  });
});

describe("formatISODate", () => {
  it("pads the year", () => {
    expect(formatISODate(parseISODate("0099-01-02"))).toBe("0099-01-02");
  });
});

describe("formatRelative", () => {
  it("labels a recent instant", () => {
    const now = new Date("2024-03-05T00:00:00.000Z");
    expect(formatRelative(new Date(now.getTime() - 5_000), now)).toBe("just now");
    expect(formatRelative(new Date(now.getTime() - 120_000), now)).toBe("2 minutes ago");
  });
});

describe("diffDays", () => {
  it("counts calendar days", () => {
    expect(diffDays(addDays(day, 3), day)).toBe(3);
  });
});

describe("isWeekend", () => {
  it("detects saturday and sunday in utc", () => {
    expect(isWeekend(parseISODate("2024-03-09"))).toBe(true);
    expect(isWeekend(parseISODate("2024-03-05"))).toBe(false);
  });
});

describe("clampDate", () => {
  it("limits a date", () => {
    expect(clampDate(addDays(day, 10), day, addDays(day, 2)).toISOString()).toBe(
      addDays(day, 2).toISOString(),
    );
  });
});

describe("parseISODate", () => {
  it("rejects impossible dates", () => {
    expect(() => parseISODate("2024-02-31")).toThrow(RangeError);
  });
});

describe("minDate", () => {
  it("returns the earliest", () => {
    expect(minDate([addDays(day, 1), day])).toEqual(day);
  });
});

describe("maxDate", () => {
  it("returns the latest", () => {
    expect(maxDate([day, addDays(day, 1)])).toEqual(addDays(day, 1));
  });
});

describe("isValidDate", () => {
  it("rejects invalid dates", () => {
    expect(isValidDate(day)).toBe(true);
    expect(isValidDate(new Date("nope"))).toBe(false);
    expect(isValidDate("2024-03-05")).toBe(false);
  });
});
