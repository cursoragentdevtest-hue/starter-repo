import { assertIndexInRange } from "@/lib/assert";

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

/** Returns the silly fact at `index` (0-based). */
export function getFactAt(index: number): string {
  const safeIndex = assertIndexInRange("getFactAt", index, FACTS.length);
  return FACTS[safeIndex];
}

/** Returns the duck quip at `index` (0-based). */
export function getQuackAt(index: number): string {
  const safeIndex = assertIndexInRange("getQuackAt", index, QUACKS.length);
  return QUACKS[safeIndex];
}
