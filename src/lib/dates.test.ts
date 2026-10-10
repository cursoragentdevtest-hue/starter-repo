import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  daysInMonth,
  diffDays,
  endOfDay,
  formatIsoDate,
  formatRelative,
  isAfter,
  isBefore,
  isBetween,
  isLeapYear,
  isSameDay,
  isWeekend,
  minDate,
  parseIsoDate,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "./dates";

const iso = (value: string) => new Date(value);

describe("startOfDay", () => {
  it("returns midnight UTC", () => {
    expect(startOfDay(iso("2020-05-06T12:00:00.000Z")).toISOString()).toBe("2020-05-06T00:00:00.000Z");
  });
});

describe("endOfDay", () => {
  it("returns the last millisecond", () => {
    expect(endOfDay(iso("2020-05-06T12:00:00.000Z")).toISOString()).toBe("2020-05-06T23:59:59.999Z");
  });
});

describe("addDays", () => {
  it("crosses month boundaries", () => {
    expect(addDays(iso("2020-01-31T00:00:00.000Z"), 1).toISOString()).toBe("2020-02-01T00:00:00.000Z");
  });

  it("keeps years 0-99", () => {
    expect(formatIsoDate(addDays(parseIsoDate("0004-02-28"), 1))).toBe("0004-02-29");
  });
});

describe("addMonths", () => {
  it("clamps the day", () => {
    expect(addMonths(iso("2020-01-31T00:00:00.000Z"), 1).toISOString()).toBe("2020-02-29T00:00:00.000Z");
  });
});

describe("addYears", () => {
  it("clamps leap day", () => {
    expect(addYears(iso("2020-02-29T00:00:00.000Z"), 1).toISOString()).toBe("2021-02-28T00:00:00.000Z");
  });
});

describe("diffDays", () => {
  it("counts whole UTC days", () => {
    expect(diffDays(iso("2020-01-01T00:00:00.000Z"), iso("2020-01-03T00:00:00.000Z"))).toBe(2);
  });
});

describe("isWeekend", () => {
  it("detects Saturday", () => {
    expect(isWeekend(iso("2020-01-04T00:00:00.000Z"))).toBe(true);
    expect(isWeekend(iso("2020-01-06T00:00:00.000Z"))).toBe(false);
  });
});

describe("isSameDay", () => {
  it("compares the UTC date", () => {
    expect(isSameDay(iso("2020-01-01T01:00:00.000Z"), iso("2020-01-01T23:00:00.000Z"))).toBe(true);
  });
});

describe("isBefore", () => {
  it("compares instants", () => {
    expect(isBefore(iso("2020-01-01T00:00:00.000Z"), iso("2020-01-02T00:00:00.000Z"))).toBe(true);
  });
});

describe("isAfter", () => {
  it("compares instants", () => {
    expect(isAfter(iso("2020-01-02T00:00:00.000Z"), iso("2020-01-01T00:00:00.000Z"))).toBe(true);
  });
});

describe("isBetween", () => {
  it("uses an inclusive range", () => {
    expect(
      isBetween(iso("2020-01-02T00:00:00.000Z"), iso("2020-01-01T00:00:00.000Z"), iso("2020-01-03T00:00:00.000Z")),
    ).toBe(true);
  });
});

describe("formatIsoDate", () => {
  it("formats YYYY-MM-DD", () => {
    expect(formatIsoDate(iso("2020-05-06T12:00:00.000Z"))).toBe("2020-05-06");
  });
});

describe("parseIsoDate", () => {
  it("parses midnight UTC", () => {
    expect(parseIsoDate("2020-05-06").toISOString()).toBe("2020-05-06T00:00:00.000Z");
  });

  it("rejects impossible dates", () => {
    expect(() => parseIsoDate("2020-02-31")).toThrow(RangeError);
  });
});

describe("startOfMonth", () => {
  it("returns the first of the month", () => {
    expect(startOfMonth(iso("2020-05-06T12:00:00.000Z")).toISOString()).toBe("2020-05-01T00:00:00.000Z");
  });
});

describe("startOfWeek", () => {
  it("returns the previous Monday", () => {
    expect(startOfWeek(iso("2020-01-01T00:00:00.000Z")).toISOString()).toBe("2019-12-30T00:00:00.000Z");
  });
});

describe("formatRelative", () => {
  it("describes a future gap", () => {
    expect(formatRelative(iso("2020-01-03T00:00:00.000Z"), iso("2020-01-01T00:00:00.000Z"))).toBe("in 2 days");
  });
});

describe("isLeapYear", () => {
  it("follows the Gregorian rule", () => {
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe("daysInMonth", () => {
  it("counts February in a leap year", () => {
    expect(daysInMonth(iso("2020-02-01T00:00:00.000Z"))).toBe(29);
  });
});

describe("clampDate", () => {
  it("clamps to the range", () => {
    expect(
      clampDate(iso("2020-01-05T00:00:00.000Z"), iso("2020-01-01T00:00:00.000Z"), iso("2020-01-02T00:00:00.000Z")).toISOString(),
    ).toBe("2020-01-02T00:00:00.000Z");
  });
});

describe("minDate", () => {
  it("returns the earlier instant", () => {
    expect(minDate(iso("2020-01-02T00:00:00.000Z"), iso("2020-01-01T00:00:00.000Z")).toISOString()).toBe(
      "2020-01-01T00:00:00.000Z",
    );
  });
});
