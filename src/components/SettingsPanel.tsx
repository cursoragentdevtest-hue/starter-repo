"use client";

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-labelledby="settings-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border-2 border-amber-300/70 bg-white p-6 shadow-2xl dark:border-amber-700/70 dark:bg-amber-950"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="settings-title" className="text-xl font-bold text-amber-950 dark:text-amber-50">
              Settings
            </h2>
            <p className="mt-1 text-sm text-amber-800/70 dark:text-amber-200/70">
              Opened with Ctrl+, even right after submit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm text-amber-900/80 dark:text-amber-100/80">
          <label className="flex items-center justify-between gap-3">
            <span>Quack volume</span>
            <input type="range" defaultValue={70} className="w-32 accent-amber-500" />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Duck enthusiasm</span>
            <input type="checkbox" defaultChecked className="size-4 accent-amber-500" />
          </label>
        </div>
      </section>
    </div>
  );
}
