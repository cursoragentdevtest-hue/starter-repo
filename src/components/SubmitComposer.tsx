"use client";

import { useRef, useState } from "react";

type SubmitComposerProps = {
  onSubmit?: (message: string) => void;
};

export function SubmitComposer({ onSubmit }: SubmitComposerProps) {
  const [value, setValue] = useState("");
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const message = value.trim();
    if (!message) {
      return;
    }

    onSubmit?.(message);
    setLastMessage(message);
    setLastSubmittedAt(Date.now());
    setValue("");
    textareaRef.current?.blur();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <section className="w-full max-w-xl rounded-2xl border-2 border-dashed border-amber-300/70 bg-white/70 p-4 text-left backdrop-blur-sm dark:border-amber-700/70 dark:bg-amber-950/50">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
          GLINT-862 repro
        </h2>
        <p className="text-xs text-amber-700/70 dark:text-amber-300/70">
          After submit, press <kbd className="rounded bg-amber-100 px-1.5 py-0.5 font-mono dark:bg-amber-900">Ctrl+,</kbd>
        </p>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        placeholder="Type a message and submit, then open settings immediately..."
        className="w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none ring-amber-400 focus:ring-2 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 active:scale-[0.98]"
        >
          Submit
        </button>

        {lastSubmittedAt ? (
          <p className="text-xs text-amber-800/70 dark:text-amber-200/70">
            Submitted {new Date(lastSubmittedAt).toLocaleTimeString()}
            {lastMessage ? ` · "${lastMessage}"` : ""}
          </p>
        ) : (
          <p className="text-xs text-amber-800/50 dark:text-amber-200/50">No submission yet</p>
        )}
      </div>
    </section>
  );
}
