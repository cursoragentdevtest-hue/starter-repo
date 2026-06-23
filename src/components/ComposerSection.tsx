"use client";

import { useState } from "react";
import { ComposerSubmit } from "@/components/ComposerSubmit";

export function ComposerSection() {
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <ComposerSubmit onSubmit={setLastMessage} />
      {lastMessage ? (
        <p className="max-w-xl text-center text-sm text-amber-900/70 dark:text-amber-100/70">
          Last message: <span className="font-mono">&ldquo;{lastMessage}&rdquo;</span>
        </p>
      ) : null}
    </div>
  );
}
