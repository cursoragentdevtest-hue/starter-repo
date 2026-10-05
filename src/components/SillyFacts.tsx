"use client";

import { useEffect, useState } from "react";
import { FACTS } from "@/lib/catalog";

export { FACTS };

export function SillyFacts() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

    const interval = setInterval(() => {
      setVisible(false);

      if (fadeTimeout !== null) {
        clearTimeout(fadeTimeout);
      }

      fadeTimeout = setTimeout(() => {
        setIndex((i) => (i + 1) % FACTS.length);
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
      className={`max-w-lg text-center text-lg italic text-amber-800/80 transition-opacity duration-300 dark:text-amber-100/80 ${visible ? "opacity-100" : "opacity-0"}`}
      aria-live="polite"
      aria-atomic="true"
    >
      &ldquo;{FACTS[index]}&rdquo;
    </p>
  );
}
