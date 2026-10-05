"use client";

import { useState } from "react";
import { QUACKS } from "@/content/quacks";
import { pickDifferent } from "@/lib/random";

export function DuckButton() {
  const [quack, setQuack] = useState("Press for wisdom");
  const [wobble, setWobble] = useState(false);

  function handleClick() {
    setQuack(pickDifferent(QUACKS, quack));
    setWobble(true);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleClick}
        onAnimationEnd={() => setWobble(false)}
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
