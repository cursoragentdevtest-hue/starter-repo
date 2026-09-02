import { DuckButton } from "@/components/DuckButton";
import { LegA } from "@/components/LegA";
import { SillyFacts } from "@/components/SillyFacts";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 px-6 py-16 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-[10%] top-[15%] text-4xl animate-float">🍞</div>
        <div className="absolute right-[15%] top-[25%] text-3xl animate-float-delayed">✨</div>
        <div className="absolute bottom-[20%] left-[20%] text-2xl animate-float">🌊</div>
        <div className="absolute bottom-[30%] right-[10%] text-5xl animate-float-delayed">🦆</div>
      </div>

      <main className="relative z-10 flex max-w-2xl flex-col items-center gap-10 text-center">
        <div className="space-y-3">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
            Officially Unofficial
          </p>
          <h1 className="text-5xl font-black tracking-tight text-amber-950 dark:text-amber-50 sm:text-6xl">
            Silly Starter™
          </h1>
          <p className="text-xl text-amber-800/70 dark:text-amber-200/70">
            A Next.js app that absolutely does not take itself seriously.
          </p>
        </div>

        <DuckButton />

        <SillyFacts />

        <LegA />

        <div className="grid w-full gap-4 sm:grid-cols-3">
          {[
            { emoji: "⚡", label: "Fast-ish", desc: "React 19. Probably fine." },
            { emoji: "🎨", label: "Styled", desc: "Tailwind included. Duck approved." },
            { emoji: "🤷", label: "Typed", desc: "TypeScript for your mistakes." },
          ].map((item) => (
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

        <footer className="font-mono text-xs text-amber-700/50 dark:text-amber-300/50">
          Built with npm, hope, and questionable life choices ·{" "}
          <code className="rounded bg-amber-200/50 px-1 dark:bg-amber-800/50">npm run dev</code> to begin your journey
        </footer>
      </main>
    </div>
  );
}
