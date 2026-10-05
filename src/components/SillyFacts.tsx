"use client";

import { useEffect, useState } from "react";
import { nextCyclicIndex } from "@/lib/cycle";
import { FACTS } from "@/lib/quotes";

export { FACTS };

export function SillyFacts() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setIndex((i) => nextCyclicIndex(i, FACTS.length));
        setVisible(true);
        fadeTimeout = null;
      }, 300);
    }, 4000);

    return () => {
      clearInterval(interval);
      if (fadeTimeout !== null) {
        clearTimeout(fadeTimeout);
      }
    };
  }, []);

  return (
    <p
      role="status"
      aria-live="polite"
      className={`max-w-lg text-center text-lg italic text-amber-800/80 transition-opacity duration-300 dark:text-amber-100/80 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      &ldquo;{FACTS[index]}&rdquo;
    </p>
  );
}
