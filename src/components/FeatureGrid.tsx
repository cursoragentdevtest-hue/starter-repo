const features = [
  {
    title: "Fast-ish",
    body: "Turbopack in dev, because waiting is for bread to rise.",
  },
  {
    title: "Styled",
    body: "Tailwind v4, so the duck can wear whatever it wants.",
  },
  {
    title: "Typed",
    body: "TypeScript everywhere, including the quacks.",
  },
  {
    title: "Routed",
    body: "App Router pages, layouts, and one extremely important /duck.",
  },
  {
    title: "Quackable",
    body: "A button, a fact, and a route that exists only to say quack.",
  },
  {
    title: "Packaged",
    body: "npm scripts for dev, build, and lint. No secret sauce.",
  },
];

export function FeatureGrid() {
  return (
    <ul className="grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <li
          key={feature.title}
          className="rounded-2xl border border-amber-200/80 bg-white/70 p-4 shadow-sm dark:border-amber-800/80 dark:bg-amber-950/40"
        >
          <h2 className="font-semibold text-amber-950 dark:text-amber-50">
            {feature.title}
          </h2>
          <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/70">
            {feature.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
