"use client";

import { useState } from "react";

const QUACKS = [
  "Quack!",
  "Honk??",
  "Bread acquired.",
  "Professional waddler.",
  "404: dignity not found.",
  "This button does nothing. Like my degree.",
  "You're doing great, probably.",
  "Have you tried turning the duck off and on again?",
];

export function DuckButton() {
  const [quack, setQuack] = useState("Press for wisdom");
  const [wobble, setWobble] = useState(false);

  function handleClick() {
    setQuack(QUACKS[Math.floor(Math.random() * QUACKS.length)]);
    setWobble(true);
    setTimeout(() => setWobble(false), 500);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleClick}
        className={`duck-btn text-6xl transition-transform hover:scale-110 active:scale-95 ${wobble ? "wobble" : ""}`}
        aria-label="Quack button"
      >
        🦆
      </button>
      <p className="max-w-xs text-center text-sm font-mono text-amber-900/70 dark:text-amber-200/70">
        {quack}
      </p>
    </div>
  );
}
