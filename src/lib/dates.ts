/**
 * Calendar helpers. Every calendar field is read and written in UTC.
 * `Date.UTC` maps years 0–99 onto 1900–1999, so those years go through
 * `setUTCFullYear` before the date is returned.
 */

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

function assertValidDate(date: Date, label = "date"): asserts date is Date {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new RangeError(`${label} must be a valid Date`);
  }
}

function utcDate(
  year: number,
  monthIndex: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
): Date {
  const date = new Date(Date.UTC(year, monthIndex, day, hours, minutes, seconds, milliseconds));
  if (year >= 0 && year <= 99) {
    date.setUTCFullYear(year, monthIndex, day);
    date.setUTCHours(hours, minutes, seconds, milliseconds);
  }
  return date;
}

/**
 * Add an integer number of UTC days. The time of day is preserved.
 *
 * @example
 * addDays(new Date("2024-01-31T00:00:00.000Z"), 1).toISOString(); // "2024-02-01T00:00:00.000Z"
 */
export function addDays(date: Date, days: number): Date {
  assertValidDate(date);
  if (!Number.isInteger(days)) throw new RangeError("days must be an integer");
  return new Date(date.getTime() + days * DAY_MS);
}

/**
 * Add a finite number of hours, including fractional hours.
 *
 * @example
 * addHours(new Date("2024-01-01T00:00:00.000Z"), 1.5).toISOString(); // "2024-01-01T01:30:00.000Z"
 */
export function addHours(date: Date, hours: number): Date {
  assertValidDate(date);
  if (!Number.isFinite(hours)) throw new RangeError("hours must be finite");
  return new Date(date.getTime() + hours * HOUR_MS);
}

/**
 * Add a finite number of minutes, including fractional minutes.
 *
 * @example
 * addMinutes(new Date("2024-01-01T00:00:00.000Z"), 90).toISOString(); // "2024-01-01T01:30:00.000Z"
 */
export function addMinutes(date: Date, minutes: number): Date {
  assertValidDate(date);
  if (!Number.isFinite(minutes)) throw new RangeError("minutes must be finite");
  return new Date(date.getTime() + minutes * MINUTE_MS);
}

/**
 * Add an integer number of months. The day is clamped to the target month
 * and the UTC time of day is preserved.
 *
 * @example
 * addMonths(new Date("2024-01-31T15:30:00.000Z"), 1).toISOString(); // "2024-02-29T15:30:00.000Z"
 */
export function addMonths(date: Date, months: number): Date {
  assertValidDate(date);
  if (!Number.isInteger(months)) throw new RangeError("months must be an integer");
  const monthIndex = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  const day = Math.min(date.getUTCDate(), daysInMonth(year, month + 1));
  return utcDate(
    year,
    month,
    day,
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}

/**
 * UTC midnight at the start of the calendar day.
 *
 * @example
 * startOfDay(new Date("2024-06-15T18:00:00.000Z")).toISOString(); // "2024-06-15T00:00:00.000Z"
 */
export function startOfDay(date: Date): Date {
  assertValidDate(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Last UTC millisecond of the calendar day, `23:59:59.999`.
 *
 * @example
 * endOfDay(new Date("2024-06-15T00:00:00.000Z")).toISOString(); // "2024-06-15T23:59:59.999Z"
 */
export function endOfDay(date: Date): Date {
  assertValidDate(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999);
}

/**
 * UTC midnight on the first day of the month.
 *
 * @example
 * startOfMonth(new Date("2024-06-15T12:00:00.000Z")).toISOString(); // "2024-06-01T00:00:00.000Z"
 */
export function startOfMonth(date: Date): Date {
  assertValidDate(date);
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

/**
 * Last UTC millisecond of the month.
 *
 * @example
 * endOfMonth(new Date("2024-02-10T00:00:00.000Z")).toISOString(); // "2024-02-29T23:59:59.999Z"
 */
export function endOfMonth(date: Date): Date {
  assertValidDate(date);
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  return utcDate(year, monthIndex, daysInMonth(year, monthIndex + 1), 23, 59, 59, 999);
}

/**
 * Whether `left` and `right` fall on the same UTC calendar day.
 *
 * @example
 * isSameDay(new Date("2024-01-01T00:00:00.000Z"), new Date("2024-01-01T23:00:00.000Z")); // true
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
 * Whether `year` is a leap year under the proleptic Gregorian rule.
 *
 * @example
 * isLeapYear(2024); // true
 */
export function isLeapYear(year: number): boolean {
  if (!Number.isInteger(year)) throw new RangeError("year must be an integer");
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Number of days in `month` (`1`–`12`) of `year`.
 *
 * @example
 * daysInMonth(4, 2); // 29
 */
export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(year)) throw new RangeError("year must be an integer");
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError("month must be an integer from 1 to 12");
  }
  return utcDate(year, month, 0).getUTCDate();
}

/**
 * Format the UTC calendar day as `YYYY-MM-DD`. The year is padded to at least four digits.
 *
 * @example
 * formatISODate(new Date("2024-02-03T15:00:00.000Z")); // "2024-02-03"
 */
export function formatISODate(date: Date): string {
  assertValidDate(date);
  const yearValue = date.getUTCFullYear();
  const sign = yearValue < 0 ? "-" : "";
  const year = Math.abs(yearValue).toString().padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${sign}${year}-${month}-${day}`;
}

const RELATIVE_UNITS: readonly { limit: number; ms: number; singular: string; plural: string }[] = [
  { limit: 60_000, ms: 1_000, singular: "second", plural: "seconds" },
  { limit: 3_600_000, ms: 60_000, singular: "minute", plural: "minutes" },
  { limit: 86_400_000, ms: 3_600_000, singular: "hour", plural: "hours" },
  { limit: 7 * 86_400_000, ms: 86_400_000, singular: "day", plural: "days" },
  { limit: 30 * 86_400_000, ms: 7 * 86_400_000, singular: "week", plural: "weeks" },
  { limit: 365 * 86_400_000, ms: 30 * 86_400_000, singular: "month", plural: "months" },
  { limit: Number.POSITIVE_INFINITY, ms: 365 * 86_400_000, singular: "year", plural: "years" },
];

/**
 * Describe `date` relative to `now` from elapsed milliseconds, not calendar months.
 * Differences under 10 seconds are `"just now"`. Larger gaps use floored seconds,
 * minutes, hours, days, weeks, ~30-day months, and ~365-day years. A count of `1` stays singular.
 *
 * @example
 * formatRelative(new Date(1_000), new Date(0)); // "just now"
 */
export function formatRelative(date: Date, now: Date = new Date()): string {
  assertValidDate(date);
  assertValidDate(now, "now");
  const delta = date.getTime() - now.getTime();
  const elapsed = Math.abs(delta);
  if (elapsed < 10_000) return "just now";
  const future = delta > 0;
  for (const unit of RELATIVE_UNITS) {
    if (elapsed < unit.limit) {
      const count = Math.floor(elapsed / unit.ms);
      const label = count === 1 ? unit.singular : unit.plural;
      return future ? `in ${count} ${label}` : `${count} ${label} ago`;
    }
  }
  return "just now";
}

/**
 * UTC calendar days from `earlier` to `later` (`later` minus `earlier`).
 * Each instant is moved to the start of its UTC day before the difference is rounded.
 *
 * @example
 * diffDays(new Date("2024-01-03T00:00:00.000Z"), new Date("2024-01-01T23:00:00.000Z")); // 2
 */
export function diffDays(later: Date, earlier: Date): number {
  assertValidDate(later, "later");
  assertValidDate(earlier, "earlier");
  return Math.round((startOfDay(later).getTime() - startOfDay(earlier).getTime()) / DAY_MS);
}

/**
 * Whether `date` falls on Saturday or Sunday in UTC.
 *
 * @example
 * isWeekend(new Date("2024-01-06T00:00:00.000Z")); // true
 */
export function isWeekend(date: Date): boolean {
  assertValidDate(date);
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Clamp `date` to the closed interval between `min` and `max`.
 * The bounds are swapped when `min` is later than `max`. The result is always a new `Date`.
 *
 * @example
 * clampDate(new Date("2024-01-01T00:00:00.000Z"), new Date("2024-02-01T00:00:00.000Z"), new Date("2024-03-01T00:00:00.000Z")).toISOString();
 * // "2024-02-01T00:00:00.000Z"
 */
export function clampDate(date: Date, min: Date, max: Date): Date {
  assertValidDate(date);
  assertValidDate(min, "min");
  assertValidDate(max, "max");
  const low = min.getTime() <= max.getTime() ? min : max;
  const high = min.getTime() <= max.getTime() ? max : min;
  const time = date.getTime();
  if (time < low.getTime()) return new Date(low.getTime());
  if (time > high.getTime()) return new Date(high.getTime());
  return new Date(time);
}

/**
 * Parse a strict `YYYY-MM-DD` calendar day as UTC midnight.
 * The month and day must be a real calendar day.
 *
 * @example
 * parseISODate("0004-02-29").toISOString(); // "0004-02-29T00:00:00.000Z"
 */
export function parseISODate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError("expected YYYY-MM-DD");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) throw new RangeError("invalid month");
  const date = utcDate(year, month - 1, day);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new RangeError("invalid calendar day");
  }
  return date;
}

/**
 * Earliest date in `dates`, returned as a copy. Throws when the list is empty.
 *
 * @example
 * minDate([new Date("2024-02-01T00:00:00.000Z"), new Date("2024-01-01T00:00:00.000Z")]).toISOString();
 * // "2024-01-01T00:00:00.000Z"
 */
export function minDate(dates: readonly Date[]): Date {
  if (dates.length === 0) throw new RangeError("minDate of empty list");
  let best = dates[0];
  assertValidDate(best);
  for (const date of dates.slice(1)) {
    assertValidDate(date);
    if (date.getTime() < best.getTime()) best = date;
  }
  return new Date(best.getTime());
}

/**
 * Latest date in `dates`, returned as a copy. Throws when the list is empty.
 *
 * @example
 * maxDate([new Date("2024-02-01T00:00:00.000Z"), new Date("2024-01-01T00:00:00.000Z")]).toISOString();
 * // "2024-02-01T00:00:00.000Z"
 */
export function maxDate(dates: readonly Date[]): Date {
  if (dates.length === 0) throw new RangeError("maxDate of empty list");
  let best = dates[0];
  assertValidDate(best);
  for (const date of dates.slice(1)) {
    assertValidDate(date);
    if (date.getTime() > best.getTime()) best = date;
  }
  return new Date(best.getTime());
}

/**
 * Type guard for a real `Date`. This is the only date helper that accepts `unknown`.
 *
 * @example
 * isValidDate(new Date("nope")); // false
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}
