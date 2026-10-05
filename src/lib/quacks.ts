export const QUACKS = [
  "Quack!",
  "Honk??",
  "Bread acquired.",
  "Professional waddler.",
  "404: dignity not found.",
  "This button does nothing. Like my degree.",
  "You're doing great, probably.",
  "Have you tried turning the duck off and on again?",
];

/** Picks a random quack that differs from `previous`, so consecutive quacks never repeat. */
export function pickQuack(previous?: string, random: () => number = Math.random): string {
  const choices = QUACKS.filter((q) => q !== previous);
  return choices[Math.floor(random() * choices.length)];
}
