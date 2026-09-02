"use client";

import { useState } from "react";

const LEG_A_NOTES = [
  "LegA component — cprod-2374 production file-link test.",
  "This leg builds the component; LegB builds the item.",
  "Cursor Review should link owned files across repos.",
  "The duck approves of cross-repo citations.",
];

export function LegA() {
  const [noteIndex, setNoteIndex] = useState(0);

  function cycleNote() {
    setNoteIndex((i) => (i + 1) % LEG_A_NOTES.length);
  }

  return (
    <section
      className="w-full max-w-md rounded-2xl border-2 border-dashed border-amber-400/70 bg-white/70 p-5 text-left backdrop-blur-sm dark:border-amber-600/70 dark:bg-amber-950/50"
      aria-label="LegA component"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
          cprod-2374 · LegA
        </h2>
        <button
          type="button"
          onClick={cycleNote}
          className="rounded-lg bg-amber-200/80 px-2 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-300/90 dark:bg-amber-800/80 dark:text-amber-100 dark:hover:bg-amber-700/90"
        >
          Next note
        </button>
      </div>
      <p className="mt-3 text-sm text-amber-900/80 dark:text-amber-100/80">
        {LEG_A_NOTES[noteIndex]}
      </p>
    </section>
  );
}
