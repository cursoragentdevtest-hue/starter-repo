/** Error thrown when public API arguments fail validation. */
export class ValidationError extends Error {
  constructor(functionName: string, message: string) {
    super(`${functionName}: ${message}`);
    this.name = "ValidationError";
  }
}

export function assertFiniteNumber(
  functionName: string,
  value: unknown,
  parameterName: string,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ValidationError(
      functionName,
      `${parameterName} must be a finite number, received ${describeValue(value)}`,
    );
  }
  return value;
}

export function assertNonNegativeInteger(
  functionName: string,
  value: unknown,
  parameterName: string,
): number {
  const number = assertFiniteNumber(functionName, value, parameterName);
  if (!Number.isInteger(number) || number < 0) {
    throw new ValidationError(
      functionName,
      `${parameterName} must be a non-negative integer, received ${describeValue(value)}`,
    );
  }
  return number;
}

export function assertPositiveInteger(
  functionName: string,
  value: unknown,
  parameterName: string,
): number {
  const number = assertFiniteNumber(functionName, value, parameterName);
  if (!Number.isInteger(number) || number <= 0) {
    throw new ValidationError(
      functionName,
      `${parameterName} must be a positive integer, received ${describeValue(value)}`,
    );
  }
  return number;
}

export function assertIndexInRange(
  functionName: string,
  index: unknown,
  length: unknown,
  parameterName = "index",
): number {
  const safeLength = assertPositiveInteger(functionName, length, "length");
  const safeIndex = assertNonNegativeInteger(functionName, index, parameterName);
  if (safeIndex >= safeLength) {
    throw new ValidationError(
      functionName,
      `${parameterName} must be between 0 and ${safeLength - 1}, received ${safeIndex}`,
    );
  }
  return safeIndex;
}

export function assertNonEmptyReadonlyArray<T>(
  functionName: string,
  items: unknown,
  parameterName = "items",
): readonly T[] {
  if (!Array.isArray(items)) {
    throw new ValidationError(
      functionName,
      `${parameterName} must be an array, received ${describeValue(items)}`,
    );
  }
  if (items.length === 0) {
    throw new ValidationError(functionName, `${parameterName} must not be empty`);
  }
  return items as readonly T[];
}

export function assertRandomFn(
  functionName: string,
  random: unknown,
  parameterName = "random",
): () => number {
  if (typeof random !== "function") {
    throw new ValidationError(
      functionName,
      `${parameterName} must be a function, received ${describeValue(random)}`,
    );
  }
  return random as () => number;
}

function describeValue(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "undefined";
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return String(value);
}
