"use client";

import { SettingsProvider, useSettings } from "@/components/SettingsContext";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SubmitComposer } from "@/components/SubmitComposer";
import { useSettingsShortcut } from "@/hooks/useSettingsShortcut";

function Glint862ReproInner() {
  const { openSettings } = useSettings();
  useSettingsShortcut(openSettings);

  return (
    <>
      <SubmitComposer />
      <SettingsPanel />
    </>
  );
}

export function Glint862Repro() {
  return (
    <SettingsProvider>
      <Glint862ReproInner />
    </SettingsProvider>
  );
}
