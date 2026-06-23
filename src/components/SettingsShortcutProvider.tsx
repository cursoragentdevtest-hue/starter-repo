"use client";

import { useCallback, useEffect, useState } from "react";
import { SettingsPanel } from "@/components/SettingsPanel";

type SettingsShortcutProviderProps = {
  children: React.ReactNode;
};

function isSettingsShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && event.key === ",";
}

export function SettingsShortcutProvider({ children }: SettingsShortcutProviderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsOpenedAt, setSettingsOpenedAt] = useState<number | null>(null);

  const openSettings = useCallback(() => {
    setSettingsOpen(true);
    setSettingsOpenedAt(Date.now());
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isSettingsShortcut(event)) {
        return;
      }

      event.preventDefault();
      openSettings();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openSettings]);

  return (
    <>
      {children}
      <SettingsPanel open={settingsOpen} onClose={closeSettings} openedAt={settingsOpenedAt} />
    </>
  );
}
