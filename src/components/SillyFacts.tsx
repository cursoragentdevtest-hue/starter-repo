"use client";

import { useEffect, useState } from "react";
import { FACTS } from "@/lib/facts";

export const ROTATE_MS = 4000;
// Must match the `duration-300` transition class below.
export const FADE_MS = 300;

export function SillyFacts() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setIndex((i) => (i + 1) % FACTS.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, []);

  return (
    <p
      className={`max-w-lg text-center text-lg italic text-amber-800/80 transition-opacity duration-300 dark:text-amber-100/80 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      &ldquo;{FACTS[index]}&rdquo;
    </p>
  );
}
