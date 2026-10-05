"use client";

import { nextCircularIndex } from "@/lib/arrays";
import { FACTS } from "@/lib/content";
import { useEffect, useState } from "react";

export function SillyFacts() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const interval = setInterval(() => {
      setVisible(false);
      if (fadeTimeoutId !== null) {
        clearTimeout(fadeTimeoutId);
      }
      fadeTimeoutId = setTimeout(() => {
        fadeTimeoutId = null;
        setIndex((i) => nextCircularIndex(i, FACTS.length));
        setVisible(true);
      }, 300);
    }, 4000);

    return () => {
      clearInterval(interval);
      if (fadeTimeoutId !== null) {
        clearTimeout(fadeTimeoutId);
      }
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
