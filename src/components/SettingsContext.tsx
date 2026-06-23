"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SettingsContextValue = {
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  lastOpenedAt: number | null;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastOpenedAt, setLastOpenedAt] = useState<number | null>(null);

  const openSettings = useCallback(() => {
    setIsOpen(true);
    setLastOpenedAt(Date.now());
  }, []);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, openSettings, closeSettings, lastOpenedAt }),
    [isOpen, openSettings, closeSettings, lastOpenedAt],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
