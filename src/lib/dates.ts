/**
 * UTC calendar helpers. Local timezone offsets never affect these results.
 * Years 0–99 are set with `setUTCFullYear` so they are not shifted into
 * the 1900s the way `Date.UTC` does.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

function utcDate(year: number, monthIndex: number, day: number, hours = 0, minutes = 0, seconds = 0, ms = 0): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, monthIndex, day);
  date.setUTCHours(hours, minutes, seconds, ms);
  return date;
}

function assertValid(date: Date, name = "date"): void {
  if (!isValidDate(date)) throw new RangeError(`${name} must be a valid Date.`);
}

/** @example addDays(utc, 1) */
export function addDays(date: Date, days: number): Date {
  assertValid(date);
  if (!Number.isFinite(days)) throw new RangeError("days must be finite.");
  return new Date(date.getTime() + days * DAY_MS);
}

/** @example addHours(utc, 3) */
export function addHours(date: Date, hours: number): Date {
  assertValid(date);
  if (!Number.isFinite(hours)) throw new RangeError("hours must be finite.");
  return new Date(date.getTime() + hours * HOUR_MS);
}

/** @example addMinutes(utc, 15) */
export function addMinutes(date: Date, minutes: number): Date {
  assertValid(date);
  if (!Number.isFinite(minutes)) throw new RangeError("minutes must be finite.");
  return new Date(date.getTime() + minutes * MINUTE_MS);
}

/**
 * Add calendar months in UTC, clamping the day to the target month.
 *
 * @example
 * addMonths(parseISODate("2024-01-31"), 1); // 2024-02-29
 */
export function addMonths(date: Date, months: number): Date {
  assertValid(date);
  if (!Number.isInteger(months)) throw new RangeError("months must be an integer.");
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const target = utcDate(year, monthIndex, 1);
  const dim = daysInMonth(target.getUTCFullYear(), target.getUTCMonth() + 1);
  return utcDate(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    Math.min(day, dim),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}

/** @example startOfDay(date) */
export function startOfDay(date: Date): Date {
  assertValid(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** @example endOfDay(date) */
export function endOfDay(date: Date): Date {
  assertValid(date);
  return utcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23,
    59,
    59,
    999,
  );
}

/** @example startOfMonth(date) */
export function startOfMonth(date: Date): Date {
  assertValid(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

/** @example endOfMonth(date) */
export function endOfMonth(date: Date): Date {
  assertValid(date);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return utcDate(year, month, daysInMonth(year, month + 1), 23, 59, 59, 999);
}

/** @example isSameDay(a, b) */
export function isSameDay(left: Date, right: Date): boolean {
  assertValid(left, "left");
  assertValid(right, "right");
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

/** @example isLeapYear(2024); // true */
export function isLeapYear(year: number): boolean {
  if (!Number.isInteger(year)) throw new RangeError("year must be an integer.");
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Days in a 1-based month.
 *
 * @example
 * daysInMonth(2024, 2); // 29
 */
export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError("month must be an integer from 1 to 12.");
  }
  return utcDate(year, month, 0).getUTCDate();
}

/** @example formatISODate(parseISODate("2024-03-05")); // "2024-03-05" */
export function formatISODate(date: Date): string {
  assertValid(date);
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Coarse relative label compared with `now`.
 *
 * @example
 * formatRelative(new Date(Date.now() - 5_000), new Date()); // "just now"
 */
export function formatRelative(date: Date, now = new Date()): string {
  assertValid(date);
  assertValid(now, "now");
  const deltaSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(deltaSeconds);
  const future = deltaSeconds > 0;
  const phrase = (unit: string) => (future ? `in ${unit}` : `${unit} ago`);
  if (abs < 10) return "just now";
  if (abs < 60) return phrase(`${abs} seconds`);
  const minutes = Math.round(abs / 60);
  if (minutes < 60) return phrase(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  const hours = Math.round(abs / 3600);
  if (hours < 24) return phrase(`${hours} hour${hours === 1 ? "" : "s"}`);
  const days = Math.round(abs / 86400);
  return phrase(`${days} day${days === 1 ? "" : "s"}`);
}

/** @example diffDays(later, earlier) */
export function diffDays(left: Date, right: Date): number {
  assertValid(left, "left");
  assertValid(right, "right");
  return Math.round((startOfDay(left).getTime() - startOfDay(right).getTime()) / DAY_MS);
}

/** @example isWeekend(parseISODate("2024-03-09")); // true */
export function isWeekend(date: Date): boolean {
  assertValid(date);
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/** @example clampDate(date, start, end) */
export function clampDate(date: Date, min: Date, max: Date): Date {
  assertValid(date);
  assertValid(min, "min");
  assertValid(max, "max");
  const low = Math.min(min.getTime(), max.getTime());
  const high = Math.max(min.getTime(), max.getTime());
  return new Date(Math.min(high, Math.max(low, date.getTime())));
}

/**
 * Parse `YYYY-MM-DD` as a UTC midnight date.
 *
 * @example
 * formatISODate(parseISODate("0099-01-02")); // "0099-01-02"
 */
export function parseISODate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError("expected a YYYY-MM-DD date.");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = utcDate(year, month - 1, day);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError("calendar date is out of range.");
  }
  return date;
}

/** @example minDate(a, b) */
export function minDate(dates: readonly Date[]): Date {
  if (dates.length === 0) throw new RangeError("minDate expects at least one date.");
  return dates.reduce((best, date) => (date.getTime() < best.getTime() ? date : best));
}

/** @example maxDate(a, b) */
export function maxDate(dates: readonly Date[]): Date {
  if (dates.length === 0) throw new RangeError("maxDate expects at least one date.");
  return dates.reduce((best, date) => (date.getTime() > best.getTime() ? date : best));
}

/** @example isValidDate(new Date()); // true */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}
