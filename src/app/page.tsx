import { DuckButton } from "@/components/DuckButton";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Hero } from "@/components/Hero";
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
        <Hero />

        <DuckButton />

        <SillyFacts />

        <FeatureGrid />

        <footer className="font-mono text-xs text-amber-700/50 dark:text-amber-300/50">
          Built with npm, hope, and questionable life choices ·{" "}
          <code className="rounded bg-amber-200/50 px-1 dark:bg-amber-800/50">npm run dev</code> to begin your journey
        </footer>
      </main>
    </div>
  );
}
