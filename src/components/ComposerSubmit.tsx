"use client";

import { useRef, useState } from "react";

type ComposerSubmitProps = {
  onSubmit: (message: string) => void;
};

export function ComposerSubmit({ onSubmit }: ComposerSubmitProps) {
  const [value, setValue] = useState("");
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    onSubmit(trimmed);
    setLastSubmittedAt(Date.now());
    setValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="w-full max-w-xl space-y-3 rounded-2xl border-2 border-dashed border-amber-300/60 bg-white/70 p-4 backdrop-blur-sm dark:border-amber-700/60 dark:bg-amber-950/50">
      <label htmlFor="composer-input" className="block text-left text-sm font-semibold text-amber-950 dark:text-amber-50">
        Composer
      </label>
      <textarea
        id="composer-input"
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        placeholder="Type a message and press Enter to submit..."
        className="w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none ring-amber-400 focus:ring-2 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-left text-xs text-amber-800/60 dark:text-amber-200/60">
          Enter submits. After submit, press Ctrl+, to open settings immediately.
        </p>
        <button
          type="button"
          onClick={submit}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-400 active:scale-[0.98]"
        >
          Submit
        </button>
      </div>
      {lastSubmittedAt !== null ? (
        <p className="text-left font-mono text-xs text-emerald-700 dark:text-emerald-300">
          Submitted at {new Date(lastSubmittedAt).toLocaleTimeString()}. Try Ctrl+, now.
        </p>
      ) : null}
    </div>
  );
}
