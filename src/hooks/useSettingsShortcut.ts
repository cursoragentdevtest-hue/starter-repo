"use client";

import { useEffect } from "react";

function isSettingsShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && event.key === ",";
}

export function useSettingsShortcut(openSettings: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isSettingsShortcut(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openSettings();
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [openSettings]);
}
