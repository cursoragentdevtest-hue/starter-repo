"use client";

import { useEffect, useRef, useState } from "react";
import { INITIAL_CAPTION, pickQuack } from "@/lib/catalog";

export { INITIAL_CAPTION, QUACKS } from "@/lib/catalog";

export function DuckButton() {
  const [caption, setCaption] = useState(INITIAL_CAPTION);
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
    setCaption(pickQuack());
    setWobble(true);

    if (wobbleTimeoutRef.current !== null) {
      clearTimeout(wobbleTimeoutRef.current);
    }

    wobbleTimeoutRef.current = setTimeout(() => {
      setWobble(false);
      wobbleTimeoutRef.current = null;
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
      <p
        className="max-w-xs text-center text-sm font-mono text-amber-900/70 dark:text-amber-200/70"
        aria-live="polite"
      >
        {caption}
      </p>
    </div>
  );
}
