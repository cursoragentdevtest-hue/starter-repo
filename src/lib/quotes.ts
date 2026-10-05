import { assertInteger, assertStringArray, describeValue } from "./validate";

const RAW_QUACKS = [
  "Quack!",
  "Honk??",
  "Bread acquired.",
  "Professional waddler.",
  "404: dignity not found.",
  "This button does nothing. Like my degree.",
  "You're doing great, probably.",
  "Have you tried turning the duck off and on again?",
];

const RAW_FACTS = [
  "This app has zero business logic and infinite vibes.",
  "Next.js can render on the server. This duck cannot.",
  "TypeScript knows your types. The duck knows your secrets.",
  "Tailwind has 4,291 utility classes. You will use twelve.",
  "npm install took longer than building this page.",
  "Somewhere, a senior engineer is crying over this architecture.",
  "Hot reload works. Your motivation might not.",
  "This starter repo is 90% whimsy, 10% dependencies.",
];

export const QUACKS: readonly string[] = Object.freeze([...RAW_QUACKS]);
export const FACTS: readonly string[] = Object.freeze([...RAW_FACTS]);

export function getQuote(
  listName: string,
  list: readonly string[],
  index: number,
): string {
  if (typeof listName !== "string" || listName.trim() === "") {
    throw new Error(`getQuote: "listName" must be a non-empty string, received ${describeValue(listName)}`);
  }
  assertStringArray("getQuote", listName, list);
  if (list.length === 0) {
    throw new Error(`getQuote: "${listName}" must be a non-empty array of strings, received array(length 0)`);
  }
  assertInteger("getQuote", "index", index);
  if (index < 0 || index >= list.length) {
    throw new Error(
      `getQuote: "index" must be between 0 and ${list.length - 1} for "${listName}", received ${index}`,
    );
  }
  return list[index];
}
