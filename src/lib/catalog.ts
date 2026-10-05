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

export function pickQuack(random = Math.random): string {
  return QUACKS[Math.floor(random() * QUACKS.length)];
}

export function getQuack(index: number): string {
  if (!Number.isInteger(index) || index < 0 || index >= QUACKS.length) {
    throw new RangeError(
      `Quack index must be an integer from 0 to ${QUACKS.length - 1} (got ${index})`,
    );
  }
  return QUACKS[index];
}

export function getFact(index: number): string {
  if (!Number.isInteger(index) || index < 0 || index >= FACTS.length) {
    throw new RangeError(
      `Fact index must be an integer from 0 to ${FACTS.length - 1} (got ${index})`,
    );
  }
  return FACTS[index];
}

export function pickFact(random = Math.random): string {
  return FACTS[Math.floor(random() * FACTS.length)];
}
