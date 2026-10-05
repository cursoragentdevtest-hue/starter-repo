"use client";

import { pickRandomElement } from "@/lib/arrays";
import { useEffect, useRef, useState } from "react";

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
  const wobbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (wobbleTimeoutRef.current !== null) {
        clearTimeout(wobbleTimeoutRef.current);
      }
    };
  }, []);

  function handleClick() {
    setQuack(pickRandomElement(QUACKS));
    setWobble(true);
    if (wobbleTimeoutRef.current !== null) {
      clearTimeout(wobbleTimeoutRef.current);
    }
    wobbleTimeoutRef.current = setTimeout(() => {
      wobbleTimeoutRef.current = null;
      setWobble(false);
    }, 500);
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
