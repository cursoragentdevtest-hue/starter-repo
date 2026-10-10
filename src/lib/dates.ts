/**
 * UTC calendar helpers.
 *
 * Dates are treated as UTC instants. Years 0 through 99 are set with
 * `setUTCFullYear` so they are not rewritten to 1900–1999.
 */

function utcDate(year: number, monthIndex: number, day: number, hours = 0, minutes = 0, seconds = 0, ms = 0): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, monthIndex, day);
  date.setUTCHours(hours, minutes, seconds, ms);
  return date;
}

function assertValid(date: Date): void {
  if (Number.isNaN(date.getTime())) throw new RangeError("invalid date");
}

/**
 * Start of the UTC day containing `date`.
 *
 * @param date - Instant.
 * @returns Midnight UTC.
 * @example
 * startOfDay(new Date("2020-05-06T12:00:00.000Z")).toISOString();
 * // => "2020-05-06T00:00:00.000Z"
 */
export function startOfDay(date: Date): Date {
  assertValid(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * End of the UTC day containing `date` (last millisecond).
 *
 * @param date - Instant.
 * @returns 23:59:59.999 UTC.
 * @example
 * endOfDay(new Date("2020-05-06T12:00:00.000Z")).toISOString();
 * // => "2020-05-06T23:59:59.999Z"
 */
export function endOfDay(date: Date): Date {
  assertValid(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999);
}

/**
 * Adds calendar days in UTC.
 *
 * @param date - Instant.
 * @param days - Whole days to add. May be negative.
 * @returns A new date.
 * @example
 * addDays(new Date("2020-01-31T00:00:00.000Z"), 1).toISOString();
 * // => "2020-02-01T00:00:00.000Z"
 */
export function addDays(date: Date, days: number): Date {
  assertValid(date);
  return utcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + days,
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}

/**
 * Adds calendar months in UTC, clamping the day to the target month.
 *
 * @param date - Instant.
 * @param months - Whole months to add.
 * @returns A new date.
 * @example
 * addMonths(new Date("2020-01-31T00:00:00.000Z"), 1).toISOString();
 * // => "2020-02-29T00:00:00.000Z"
 */
export function addMonths(date: Date, months: number): Date {
  assertValid(date);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const last = utcDate(year, month + 1, 0).getUTCDate();
  return utcDate(
    year,
    month,
    Math.min(day, last),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}

/**
 * Adds calendar years in UTC, clamping Feb 29 to Feb 28.
 *
 * @param date - Instant.
 * @param years - Whole years to add.
 * @returns A new date.
 * @example
 * addYears(new Date("2020-02-29T00:00:00.000Z"), 1).toISOString();
 * // => "2021-02-28T00:00:00.000Z"
 */
export function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12);
}

/**
 * Whole UTC days from `from` to `to`.
 *
 * @param from - Start instant.
 * @param to - End instant.
 * @returns The signed day difference.
 * @example
 * diffDays(new Date("2020-01-01T00:00:00.000Z"), new Date("2020-01-03T00:00:00.000Z"));
 * // => 2
 */
export function diffDays(from: Date, to: Date): number {
  assertValid(from);
  assertValid(to);
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * Whether `date` is a Saturday or Sunday in UTC.
 *
 * @param date - Instant.
 * @returns `true` on a weekend.
 * @example
 * isWeekend(new Date("2020-01-04T00:00:00.000Z"));
 * // => true
 */
export function isWeekend(date: Date): boolean {
  assertValid(date);
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Whether two instants fall on the same UTC calendar day.
 *
 * @param a - First instant.
 * @param b - Second instant.
 * @returns `true` when the UTC dates match.
 * @example
 * isSameDay(new Date("2020-01-01T01:00:00.000Z"), new Date("2020-01-01T23:00:00.000Z"));
 * // => true
 */
export function isSameDay(a: Date, b: Date): boolean {
  assertValid(a);
  assertValid(b);
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/**
 * Whether `date` is strictly before `other`.
 *
 * @param date - Candidate.
 * @param other - Boundary.
 * @returns `true` when `date` is earlier.
 * @example
 * isBefore(new Date("2020-01-01T00:00:00.000Z"), new Date("2020-01-02T00:00:00.000Z"));
 * // => true
 */
export function isBefore(date: Date, other: Date): boolean {
  assertValid(date);
  assertValid(other);
  return date.getTime() < other.getTime();
}

/**
 * Whether `date` is strictly after `other`.
 *
 * @param date - Candidate.
 * @param other - Boundary.
 * @returns `true` when `date` is later.
 * @example
 * isAfter(new Date("2020-01-02T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z"));
 * // => true
 */
export function isAfter(date: Date, other: Date): boolean {
  assertValid(date);
  assertValid(other);
  return date.getTime() > other.getTime();
}

/**
 * Whether `date` falls in the inclusive range.
 *
 * @param date - Candidate.
 * @param start - Range start.
 * @param end - Range end.
 * @returns `true` when `start <= date <= end`.
 * @example
 * isBetween(new Date("2020-01-02T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z"), new Date("2020-01-03T00:00:00.000Z"));
 * // => true
 */
export function isBetween(date: Date, start: Date, end: Date): boolean {
  assertValid(date);
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

/**
 * Formats `date` as `YYYY-MM-DD` in UTC.
 *
 * @param date - Instant.
 * @returns The calendar date.
 * @example
 * formatIsoDate(new Date("2020-05-06T12:00:00.000Z"));
 * // => "2020-05-06"
 */
export function formatIsoDate(date: Date): string {
  assertValid(date);
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a `YYYY-MM-DD` string as midnight UTC.
 *
 * @param value - Calendar date.
 * @returns The instant.
 * @throws {RangeError} When the text is not a real date.
 * @example
 * parseIsoDate("2020-05-06").toISOString();
 * // => "2020-05-06T00:00:00.000Z"
 */
export function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError(`invalid ISO date: ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = utcDate(year, month - 1, day);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`invalid ISO date: ${value}`);
  }
  return date;
}

/**
 * Start of the UTC month.
 *
 * @param date - Instant.
 * @returns Midnight UTC on the first of the month.
 * @example
 * startOfMonth(new Date("2020-05-06T12:00:00.000Z")).toISOString();
 * // => "2020-05-01T00:00:00.000Z"
 */
export function startOfMonth(date: Date): Date {
  assertValid(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

/**
 * Start of the UTC ISO week (Monday).
 *
 * @param date - Instant.
 * @returns Midnight UTC on that Monday.
 * @example
 * startOfWeek(new Date("2020-01-01T00:00:00.000Z")).toISOString();
 * // => "2019-12-30T00:00:00.000Z"
 */
export function startOfWeek(date: Date): Date {
  assertValid(date);
  const day = date.getUTCDay();
  const delta = day === 0 ? -6 : 1 - day;
  return addDays(startOfDay(date), delta);
}

/**
 * A short relative description of `date` compared with `now`.
 *
 * @param date - Instant to describe.
 * @param now - Reference instant. Defaults to the current time.
 * @returns Phrases such as `"in 2 days"` or `"3 hours ago"`.
 * @example
 * formatRelative(new Date("2020-01-03T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z"));
 * // => "in 2 days"
 */
export function formatRelative(date: Date, now = new Date()): string {
  assertValid(date);
  assertValid(now);
  const delta = date.getTime() - now.getTime();
  const abs = Math.abs(delta);
  const units: [number, string][] = [
    [86_400_000, "day"],
    [3_600_000, "hour"],
    [60_000, "minute"],
    [1000, "second"],
  ];
  for (const [size, name] of units) {
    if (abs >= size || name === "second") {
      const count = Math.round(abs / size);
      const unit = count === 1 ? name : `${name}s`;
      return delta >= 0 ? `in ${count} ${unit}` : `${count} ${unit} ago`;
    }
  }
  return "just now";
}

/**
 * Whether the UTC year is a leap year.
 *
 * @param year - Full year.
 * @returns `true` for leap years.
 * @example
 * isLeapYear(2020);
 * // => true
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Days in the UTC month of `date`.
 *
 * @param date - Instant.
 * @returns 28–31.
 * @example
 * daysInMonth(new Date("2020-02-01T00:00:00.000Z"));
 * // => 29
 */
export function daysInMonth(date: Date): number {
  assertValid(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getUTCDate();
}

/**
 * Clamps `date` to an inclusive range.
 *
 * @param date - Instant.
 * @param start - Earliest instant.
 * @param end - Latest instant.
 * @returns The clamped instant.
 * @example
 * clampDate(new Date("2020-01-05T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z"), new Date("2020-01-02T00:00:00.000Z")).toISOString();
 * // => "2020-01-02T00:00:00.000Z"
 */
export function clampDate(date: Date, start: Date, end: Date): Date {
  assertValid(date);
  if (date.getTime() < start.getTime()) return new Date(start.getTime());
  if (date.getTime() > end.getTime()) return new Date(end.getTime());
  return new Date(date.getTime());
}

/**
 * The earlier of two instants.
 *
 * @param a - First instant.
 * @param b - Second instant.
 * @returns A copy of the earlier instant.
 * @example
 * minDate(new Date("2020-01-02T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z")).toISOString();
 * // => "2020-01-01T00:00:00.000Z"
 */
export function minDate(a: Date, b: Date): Date {
  assertValid(a);
  assertValid(b);
  return new Date(Math.min(a.getTime(), b.getTime()));
}
