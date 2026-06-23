"use client";

import { useRef, useState, type FormEvent } from "react";

type SubmitComposerProps = {
  onSubmit: (message: string) => void;
};

export function SubmitComposer({ onSubmit }: SubmitComposerProps) {
  const [value, setValue] = useState("");
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = value.trim();
    if (!message) {
      return;
    }

    onSubmit(message);
    setLastSubmitted(message);
    setValue("");

    // Keep focus in the composer, like chat submit does.
    inputRef.current?.focus();
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border-2 border-dashed border-amber-300/60 bg-white/70 p-4 backdrop-blur-sm dark:border-amber-700/60 dark:bg-amber-950/50">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Type a message and submit, then press Ctrl+,"
          className="flex-1 rounded-xl border border-amber-300/70 bg-white px-3 py-2 text-sm text-amber-950 outline-none ring-amber-400 focus:ring-2 dark:border-amber-700/70 dark:bg-amber-900 dark:text-amber-50"
        />
        <button
          type="submit"
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-400"
        >
          Submit
        </button>
      </form>
      {lastSubmitted ? (
        <p className="mt-3 font-mono text-xs text-amber-800/70 dark:text-amber-200/70">
          Last submitted: <span className="font-semibold">{lastSubmitted}</span>
        </p>
      ) : null}
    </div>
  );
}
