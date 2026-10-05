export const QUACKS = [
  "Quack!",
  "Honk??",
  "Bread acquired.",
  "Professional waddler.",
  "404: dignity not found.",
  "This button does nothing. Like my degree.",
  "You're doing great, probably.",
  "Have you tried turning the duck off and on again?",
] as const;

export const FACTS = [
  "This app has zero business logic and infinite vibes.",
  "Next.js can render on the server. This duck cannot.",
  "TypeScript knows your types. The duck knows your secrets.",
  "Tailwind has 4,291 utility classes. You will use twelve.",
  "npm install took longer than building this page.",
  "Somewhere, a senior engineer is crying over this architecture.",
  "Hot reload works. Your motivation might not.",
  "This starter repo is 90% whimsy, 10% dependencies.",
] as const;

export const INITIAL_CAPTION = "Press for wisdom";

export type RandomSource = () => number;

function describeValue(value: unknown): string {
  if (typeof value === "string") return `string ${JSON.stringify(value)}`;
  if (typeof value === "number") return `number ${value}`;
  if (typeof value === "function") return "function";
  if (value === null) return "null";
  return `${typeof value}`;
}

function assertRandomSource(
  random: unknown,
  functionName: "pickQuack" | "pickFact",
): asserts random is RandomSource {
  if (typeof random !== "function") {
    throw new TypeError(
      `${functionName}(random): random must be a function that returns a number in [0, 1) (got ${describeValue(random)})`,
    );
  }
}

function readUnitInterval(
  random: RandomSource,
  functionName: "pickQuack" | "pickFact",
): number {
  const value = random();
  if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value >= 1) {
    throw new RangeError(
      `${functionName}(random): random() must return a number in [0, 1) (got ${describeValue(value)})`,
    );
  }
  return value;
}

function assertCatalogIndex(
  index: unknown,
  length: number,
  label: "Quack" | "Fact",
): asserts index is number {
  if (typeof index !== "number" || Number.isNaN(index)) {
    throw new TypeError(
      `${label} index must be a number (got ${describeValue(index)})`,
    );
  }
  if (!Number.isInteger(index)) {
    throw new RangeError(
      `${label} index must be an integer (got ${index})`,
    );
  }
  if (index < 0 || index >= length) {
    throw new RangeError(
      `${label} index out of range: expected 0..${length - 1}, got ${index}`,
    );
  }
}

export function pickQuack(random: RandomSource = Math.random): string {
  assertRandomSource(random, "pickQuack");
  const value = readUnitInterval(random, "pickQuack");
  return QUACKS[Math.floor(value * QUACKS.length)];
}

export function pickFact(random: RandomSource = Math.random): string {
  assertRandomSource(random, "pickFact");
  const value = readUnitInterval(random, "pickFact");
  return FACTS[Math.floor(value * FACTS.length)];
}

export function getQuack(index: number): string {
  assertCatalogIndex(index, QUACKS.length, "Quack");
  return QUACKS[index];
}

export function getFact(index: number): string {
  assertCatalogIndex(index, FACTS.length, "Fact");
  return FACTS[index];
}
