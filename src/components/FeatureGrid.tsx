const FEATURES = [
  { emoji: "⚡", label: "Fast-ish", desc: "React 19. Probably fine." },
  { emoji: "🎨", label: "Styled", desc: "Tailwind included. Duck approved." },
  { emoji: "🤷", label: "Typed", desc: "TypeScript for your mistakes." },
  { emoji: "🗺️", label: "Routed", desc: "App Router. One page. That's the map." },
  { emoji: "🦆", label: "Quackable", desc: "Press the duck. Receive wisdom." },
  { emoji: "📦", label: "Packaged", desc: "npm scripts. Hope not included." },
];

export function FeatureGrid() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {FEATURES.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border-2 border-dashed border-amber-300/60 bg-white/60 p-4 backdrop-blur-sm dark:border-amber-700/60 dark:bg-amber-950/40"
        >
          <div className="text-2xl">{item.emoji}</div>
          <div className="mt-1 font-bold text-amber-950 dark:text-amber-50">{item.label}</div>
          <div className="text-sm text-amber-800/60 dark:text-amber-200/60">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
