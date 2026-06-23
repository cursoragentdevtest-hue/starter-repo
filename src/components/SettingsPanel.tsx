"use client";

import { useSettings } from "@/components/SettingsContext";

export function SettingsPanel() {
  const { isOpen, closeSettings, lastOpenedAt } = useSettings();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/40 p-4 backdrop-blur-sm"
      onClick={closeSettings}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border-2 border-amber-300/70 bg-white p-6 shadow-xl dark:border-amber-700/70 dark:bg-amber-950"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="settings-title" className="text-xl font-bold text-amber-950 dark:text-amber-50">
              Settings
            </h2>
            <p className="mt-1 text-sm text-amber-800/70 dark:text-amber-200/70">
              Opened via <kbd className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">Ctrl+,</kbd>
            </p>
          </div>
          <button
            type="button"
            onClick={closeSettings}
            className="rounded-lg px-2 py-1 text-sm text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900"
            aria-label="Close settings"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2 rounded-xl bg-amber-50 p-4 font-mono text-xs text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">
          <p>GLINT-862 repro: settings should open immediately after submit.</p>
          {lastOpenedAt ? (
            <p>Opened at: {new Date(lastOpenedAt).toLocaleTimeString()}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
