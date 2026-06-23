"use client";

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
  openedAt: number | null;
};

export function SettingsPanel({ open, onClose, openedAt }: SettingsPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-amber-950/30 backdrop-blur-[1px]"
        aria-label="Close settings"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="relative flex h-full w-full max-w-md flex-col border-l-2 border-amber-300/60 bg-white shadow-2xl dark:border-amber-700/60 dark:bg-amber-950"
      >
        <header className="flex items-center justify-between border-b border-amber-200/80 px-5 py-4 dark:border-amber-800/80">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
              Ctrl + ,
            </p>
            <h2 className="text-xl font-bold text-amber-950 dark:text-amber-50">Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm font-medium text-amber-800 transition hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900"
          >
            Close
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
          <section className="space-y-2">
            <h3 className="font-semibold text-amber-950 dark:text-amber-50">Quack intensity</h3>
            <input type="range" min={0} max={100} defaultValue={70} className="w-full accent-amber-500" />
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-amber-950 dark:text-amber-50">Duck enthusiasm</h3>
            <label className="flex items-center gap-2 text-sm text-amber-900/80 dark:text-amber-100/80">
              <input type="checkbox" defaultChecked className="accent-amber-500" />
              Enable maximum wobble on submit
            </label>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-amber-950 dark:text-amber-50">Keyboard shortcut</h3>
            <p className="text-sm text-amber-800/70 dark:text-amber-200/70">
              Press <kbd className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">Ctrl</kbd>{" "}
              +{" "}
              <kbd className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">,</kbd> any time,
              including right after submit.
            </p>
          </section>
        </div>

        {openedAt !== null ? (
          <footer className="border-t border-amber-200/80 px-5 py-3 font-mono text-xs text-amber-700/70 dark:border-amber-800/80 dark:text-amber-300/70">
            Opened immediately at {new Date(openedAt).toLocaleTimeString()}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
