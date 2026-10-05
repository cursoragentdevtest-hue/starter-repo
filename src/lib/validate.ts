/** Runtime checks for public APIs. Programming mistakes throw; CLI user input uses parse errors. */

export function describeValue(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "NaN";
    if (!Number.isFinite(value)) return String(value);
    return String(value);
  }
  if (typeof value === "bigint") {
    return `${value}n`;
  }
  if (typeof value === "function") {
    return "function";
  }
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "undefined";
  }
  if (Array.isArray(value)) {
    return `array(length ${value.length})`;
  }
  return typeof value;
}

export function invalidArg(fn: string, name: string, expected: string, received: unknown): Error {
  return new Error(`${fn}: "${name}" must be ${expected}, received ${describeValue(received)}`);
}

export function assertInteger(fn: string, name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw invalidArg(fn, name, "an integer", value);
  }
}

export function assertPositiveInteger(fn: string, name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw invalidArg(fn, name, "a positive integer", value);
  }
}

export function assertFunction(fn: string, name: string, value: unknown): asserts value is (...args: never[]) => unknown {
  if (typeof value !== "function") {
    throw invalidArg(fn, name, "a function", value);
  }
}

export function assertStringArray(fn: string, name: string, value: unknown): asserts value is string[] {
  if (!Array.isArray(value)) {
    throw invalidArg(fn, name, "an array of strings", value);
  }
  for (let i = 0; i < value.length; i += 1) {
    if (typeof value[i] !== "string") {
      throw invalidArg(fn, `${name}[${i}]`, "a string", value[i]);
    }
  }
}

export function assertPlainObject(fn: string, name: string, value: unknown): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw invalidArg(fn, name, "an object", value);
  }
}
