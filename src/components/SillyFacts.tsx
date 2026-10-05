"use client";

import { useEffect, useState } from "react";
import { FACTS } from "@/content/facts";

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
      }, 300);
    }, 4000);

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
