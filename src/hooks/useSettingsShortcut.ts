"use client";

import { useEffect } from "react";

function isSettingsShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && event.key === "," && !event.altKey && !event.shiftKey;
}

export function useSettingsShortcut(onOpenSettings: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isSettingsShortcut(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onOpenSettings();
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onOpenSettings]);
}
