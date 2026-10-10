/**
 * Date helpers. Calendar math uses UTC so results do not depend on the host timezone.
 * Invalid dates and out-of-range arguments throw `RangeError`.
 */

function assertValidDate(value: Date, name = "date"): void {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new RangeError(`${name} must be a valid Date`);
  }
}

/**
 * Build a UTC date. Years 0–99 are set explicitly because `Date.UTC` maps them to 1900–1999.
 */
function utcDate(year: number, monthIndex: number, day: number, hours = 0, minutes = 0, seconds = 0, ms = 0): Date {
  const date = new Date(Date.UTC(year, monthIndex, day, hours, minutes, seconds, ms));
  if (year >= 0 && year < 100) {
    date.setUTCFullYear(year);
  }
  return date;
}

function copy(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * Add a whole number of days.
 *
 * @example
 * addDays(new Date("2020-01-01T00:00:00.000Z"), 1).toISOString();
 * // "2020-01-02T00:00:00.000Z"
 */
export function addDays(date: Date, days: number): Date {
  assertValidDate(date);
  if (!Number.isInteger(days)) {
    throw new RangeError("days must be an integer");
  }
  const next = copy(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Add a whole number of hours.
 *
 * @example
 * addHours(new Date("2020-01-01T00:00:00.000Z"), 3).toISOString();
 * // "2020-01-01T03:00:00.000Z"
 */
export function addHours(date: Date, hours: number): Date {
  assertValidDate(date);
  if (!Number.isInteger(hours)) {
    throw new RangeError("hours must be an integer");
  }
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Add a whole number of minutes.
 *
 * @example
 * addMinutes(new Date("2020-01-01T00:00:00.000Z"), 30).toISOString();
 * // "2020-01-01T00:30:00.000Z"
 */
export function addMinutes(date: Date, minutes: number): Date {
  assertValidDate(date);
  if (!Number.isInteger(minutes)) {
    throw new RangeError("minutes must be an integer");
  }
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Add calendar months in UTC, clamping the day to the target month's length.
 *
 * @example
 * addMonths(new Date("2020-01-31T00:00:00.000Z"), 1).toISOString();
 * // "2020-02-29T00:00:00.000Z"
 */
export function addMonths(date: Date, months: number): Date {
  assertValidDate(date);
  if (!Number.isInteger(months)) {
    throw new RangeError("months must be an integer");
  }
  const day = date.getUTCDate();
  const target = utcDate(date.getUTCFullYear(), date.getUTCMonth() + months, 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
  const lastDay = daysInMonth(target.getUTCFullYear(), target.getUTCMonth() + 1);
  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

/**
 * Midnight UTC on the same calendar day.
 *
 * @example
 * startOfDay(new Date("2020-06-15T13:45:00.000Z")).toISOString();
 * // "2020-06-15T00:00:00.000Z"
 */
export function startOfDay(date: Date): Date {
  assertValidDate(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * The last millisecond of the UTC day.
 *
 * @example
 * endOfDay(new Date("2020-06-15T13:45:00.000Z")).toISOString();
 * // "2020-06-15T23:59:59.999Z"
 */
export function endOfDay(date: Date): Date {
  assertValidDate(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999);
}

/**
 * Midnight UTC on the first day of the month.
 *
 * @example
 * startOfMonth(new Date("2020-06-15T00:00:00.000Z")).toISOString();
 * // "2020-06-01T00:00:00.000Z"
 */
export function startOfMonth(date: Date): Date {
  assertValidDate(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

/**
 * The last millisecond of the UTC month.
 *
 * @example
 * endOfMonth(new Date("2020-02-01T00:00:00.000Z")).toISOString();
 * // "2020-02-29T23:59:59.999Z"
 */
export function endOfMonth(date: Date): Date {
  assertValidDate(date);
  const last = daysInMonth(date.getUTCFullYear(), date.getUTCMonth() + 1);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), last, 23, 59, 59, 999);
}

/**
 * Whether two dates fall on the same UTC calendar day.
 *
 * @example
 * isSameDay(new Date("2020-01-01T01:00:00.000Z"), new Date("2020-01-01T23:00:00.000Z")); // true
 */
export function isSameDay(left: Date, right: Date): boolean {
  assertValidDate(left, "left");
  assertValidDate(right, "right");
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

/**
 * Whether `year` is a leap year in the proleptic Gregorian calendar.
 *
 * @example
 * isLeapYear(2020); // true
 */
export function isLeapYear(year: number): boolean {
  if (!Number.isInteger(year)) {
    throw new RangeError("year must be an integer");
  }
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Days in a calendar month. `month` is 1-based.
 *
 * @example
 * daysInMonth(2020, 2); // 29
 */
export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError("month must be an integer from 1 to 12");
  }
  return utcDate(year, month, 0).getUTCDate();
}

/**
 * Format a date as `YYYY-MM-DD` in UTC.
 *
 * @example
 * formatISODate(new Date("2020-06-05T12:00:00.000Z")); // "2020-06-05"
 */
export function formatISODate(date: Date): string {
  assertValidDate(date);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const sign = year < 0 ? "-" : "";
  return `${sign}${String(Math.abs(year)).padStart(4, "0")}-${month}-${day}`;
}

const RELATIVE_UNITS: readonly { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365.25 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: (365.25 / 12) * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
];

/**
 * A short relative phrase such as "in 2 days" or "3 hours ago".
 *
 * @example
 * formatRelative(new Date("2020-01-03T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z"));
 * // "in 2 days"
 */
export function formatRelative(date: Date, now: Date = new Date()): string {
  assertValidDate(date);
  assertValidDate(now, "now");
  const delta = date.getTime() - now.getTime();
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const absolute = Math.abs(delta);
  for (const { unit, ms } of RELATIVE_UNITS) {
    if (absolute >= ms || unit === "second") {
      const value = Math.round(delta / ms);
      return formatter.format(value, unit);
    }
  }
  return formatter.format(0, "second");
}

/**
 * Whole UTC days from `from` to `to`. Partial days truncate toward zero.
 *
 * @example
 * diffDays(new Date("2020-01-01T00:00:00.000Z"), new Date("2020-01-03T00:00:00.000Z")); // 2
 */
export function diffDays(from: Date, to: Date): number {
  assertValidDate(from, "from");
  assertValidDate(to, "to");
  const ms = to.getTime() - from.getTime();
  return Math.trunc(ms / (24 * 60 * 60 * 1000));
}

/**
 * Whether the UTC day is Saturday or Sunday.
 *
 * @example
 * isWeekend(new Date("2020-01-04T00:00:00.000Z")); // true
 */
export function isWeekend(date: Date): boolean {
  assertValidDate(date);
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Clamp a date to the inclusive interval `[min, max]`.
 *
 * @example
 * clampDate(new Date("2020-01-05T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z"), new Date("2020-01-02T00:00:00.000Z")).toISOString();
 * // "2020-01-02T00:00:00.000Z"
 */
export function clampDate(date: Date, min: Date, max: Date): Date {
  assertValidDate(date);
  assertValidDate(min, "min");
  assertValidDate(max, "max");
  if (min.getTime() > max.getTime()) {
    throw new RangeError("min must be earlier than or equal to max");
  }
  if (date.getTime() < min.getTime()) {
    return copy(min);
  }
  if (date.getTime() > max.getTime()) {
    return copy(max);
  }
  return copy(date);
}

/**
 * Parse a `YYYY-MM-DD` string as midnight UTC.
 *
 * @example
 * parseISODate("2020-01-02").toISOString(); // "2020-01-02T00:00:00.000Z"
 */
export function parseISODate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new RangeError("value must be YYYY-MM-DD");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError("value is not a real calendar date");
  }
  return utcDate(year, month - 1, day);
}

/**
 * The earliest valid date.
 *
 * @example
 * minDate([new Date("2020-01-02T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z")]).toISOString();
 * // "2020-01-01T00:00:00.000Z"
 */
export function minDate(dates: readonly Date[]): Date {
  if (dates.length === 0) {
    throw new RangeError("minDate requires at least one date");
  }
  return dates.reduce((earliest, date) => {
    assertValidDate(date);
    return date.getTime() < earliest.getTime() ? date : earliest;
  });
}

/**
 * The latest valid date.
 *
 * @example
 * maxDate([new Date("2020-01-02T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z")]).toISOString();
 * // "2020-01-02T00:00:00.000Z"
 */
export function maxDate(dates: readonly Date[]): Date {
  if (dates.length === 0) {
    throw new RangeError("maxDate requires at least one date");
  }
  return dates.reduce((latest, date) => {
    assertValidDate(date);
    return date.getTime() > latest.getTime() ? date : latest;
  });
}

/**
 * Whether `value` is a Date with a finite timestamp.
 *
 * @example
 * isValidDate(new Date("2020-01-01T00:00:00.000Z")); // true
 * isValidDate(new Date("nope")); // false
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}
