# React Concurrent Rendering: A Deep Tutorial

A practical, long-form guide to concurrent rendering, transitions, Suspense, `useDeferredValue`, and how React schedules work on the main thread. Written for React 19 and modern Next.js App Router apps, but the core mental model applies anywhere you render with `react-dom`.

---

## Table of contents

1. [Why concurrency exists](#1-why-concurrency-exists)
2. [The old mental model vs the new one](#2-the-old-mental-model-vs-the-new-one)
3. [What “concurrent rendering” actually means](#3-what-concurrent-rendering-actually-means)
4. [Lanes, priorities, and interruptibility](#4-lanes-priorities-and-interruptibility)
5. [Urgent updates vs transitions](#5-urgent-updates-vs-transitions)
6. [`startTransition` in depth](#6-starttransition-in-depth)
7. [`useTransition`: pending UI that stays honest](#7-usetransition-pending-ui-that-stays-honest)
8. [Suspense: boundaries, fallbacks, and reveal](#8-suspense-boundaries-fallbacks-and-reveal)
9. [Suspense for data, code, and streaming](#9-suspense-for-data-code-and-streaming)
10. [`useDeferredValue`: keep showing yesterday while computing today](#10-usedeferredvalue-keep-showing-yesterday-while-computing-today)
11. [Choosing between transitions and deferred values](#11-choosing-between-transitions-and-deferred-values)
12. [Scheduling: how React shares the main thread](#12-scheduling-how-react-shares-the-main-thread)
13. [Combining the tools in real UIs](#13-combining-the-tools-in-real-uis)
14. [Patterns that work well in Next.js](#14-patterns-that-work-well-in-nextjs)
15. [Debugging concurrent behavior](#15-debugging-concurrent-behavior)
16. [Common pitfalls and anti-patterns](#16-common-pitfalls-and-anti-patterns)
17. [A decision checklist](#17-a-decision-checklist)
18. [Further reading and practice exercises](#18-further-reading-and-practice-exercises)

---

## 1. Why concurrency exists

For years, React’s rendering model was effectively **synchronous and blocking**. When state changed, React walked the component tree, computed the next UI, and committed it to the DOM in one stretch of work. If that stretch took longer than a frame budget—roughly 16ms at 60Hz, or less on high-refresh displays—the browser could not paint, scroll, or respond to input until React finished.

That model is simple to reason about: there is one “current” UI, and updates finish before the next paint. It also creates a class of bugs that feel like “the app is freezing,” even when your business logic is correct. Typing in a search box that filters a huge list, switching tabs that remount heavy charts, or navigating while a page is still resolving data can all contend for the same main thread.

Concurrent rendering is React’s answer to that contention. It does not make JavaScript parallel in the OS sense. It makes **rendering work interruptible and prioritizable**, so React can:

- Start rendering an update
- Pause if something more urgent arrives (like a keystroke)
- Resume or abandon the incomplete work
- Keep showing a consistent previous UI until the new one is ready to commit

The goal is not “faster React” as a slogan. The goal is **responsive interaction** under load: input stays snappy, loading states are intentional, and expensive UI updates do not monopolize the thread.

If you only remember one sentence from this tutorial, remember this:

> Concurrent features let you mark some updates as non-urgent so React can keep the UI responsive while it prepares the next screen in the background.

---

## 2. The old mental model vs the new one

### Blocking render (pre-concurrent intuition)

```text
User types → setState → React renders entire subtree → commit → paint
                 └────────── cannot be interrupted ──────────┘
```

In this world, every `setState` is treated similarly: do the work now, finish it, then paint. If the render is expensive, the keystroke feels delayed because the browser never got a turn to process the input event’s visual feedback.

### Concurrent render (modern intuition)

```text
User types (urgent)     → update input value ASAP → commit → paint
Heavy filter (transition) → start render → may pause → continue → commit when ready
```

React can keep two conceptual versions of the tree in play:

- The **committed** tree: what the user currently sees
- A **work-in-progress** tree: what React is preparing

Until the work-in-progress tree is complete and React decides to commit it, the user continues to see the previous committed UI. That is why transitions feel “smooth but slightly behind,” and why pending indicators matter.

### What did *not* change

Concurrent rendering does not remove the need for:

- Correct data fetching and caching
- Memoization where computation is genuinely expensive (or, in React Compiler projects, trusting the compiler)
- Reasonable list virtualization for thousands of DOM nodes
- Avoiding accidental waterfalls and oversized client bundles

Concurrency is a **scheduler and UX contract**, not a substitute for algorithmic efficiency.

---

## 3. What “concurrent rendering” actually means

“Concurrent” in React means React may prepare multiple UI versions and interleave that preparation with other work. It does **not** mean two React trees paint at the same time in a conflicting way. At any moment, there is still one committed UI for a given root.

Practically, concurrent rendering enables:

1. **Interruptible rendering** — React can stop mid-render to handle higher-priority work.
2. **Selective hydration** — On the client, hydrated islands can become interactive in priority order (especially relevant with streaming SSR).
3. **Transitions** — You can mark updates as non-urgent.
4. **Suspense coordination** — React can wait for async dependencies and reveal UI in coordinated units.
5. **Deferred values** — You can intentionally lag a derived value so urgent UI stays current.

### A useful analogy

Think of a restaurant kitchen during a rush:

- Taking a drink order is urgent (like updating a controlled input).
- Preparing a complex entrée is important but can be interrupted if a new drink order arrives.
- Guests should not see a half-plated dish (React should not commit a torn UI mid-render).
- A “order in progress” light helps guests understand latency (pending flags / fallbacks).

React’s concurrent model is that kitchen: interruptible prep, consistent plating, and explicit signals for in-flight work.

---

## 4. Lanes, priorities, and interruptibility

You do not need to memorize React’s internal lane bitmasks to use the APIs well, but a light model helps when debugging surprising ordering.

React assigns updates to **lanes** (priority bands). Broadly:

| Kind of update | Typical source | Feel |
| --- | --- | --- |
| Discrete / urgent | Clicks, keypresses, controlled inputs | Must feel instant |
| Continuous | Dragging, scrolling-related updates | High priority, frequent |
| Default | Ordinary `setState` | Normal urgency |
| Transition | `startTransition` / `useTransition` | Lower priority, interruptible |
| Retry / idle-ish work | Continuing after Suspense, deferred work | Can wait |

When an urgent update arrives while a transition render is in progress, React can abandon or pause the transition work, process the urgent update, commit it, and later continue the transition with the latest state.

### Consistency rule

React still aims for **consistent commits**. It will not paint a tree that is only halfway through applying an update. Interruptibility happens during the render phase; the commit phase remains more atomic from the user’s point of view.

### Why this matters for your code

If you put both of these in one event handler without a transition:

```tsx
setQuery(e.target.value);          // should be urgent
setFilteredItems(expensiveFilter); // accidentally urgent too
```

…then the expensive work hitchhikes on the urgent lane. Wrap the expensive part in a transition (or defer the derived value) so typing stays immediate.

---

## 5. Urgent updates vs transitions

Almost every interactive UI has two clocks:

1. **The feedback clock** — “Did my click/key register?”
2. **The content clock** — “Is the new page/list/chart ready?”

Concurrent React gives you a first-class way to separate those clocks.

### Urgent updates

Use urgent updates when the user is directly manipulating a value that must reflect immediately:

- Text inputs and textareas
- Toggles that should flip at once
- Cursor/selection mirrors
- Anything where delay feels like a broken control

### Transition updates

Use transitions when the update navigates the user to a new *view of the world* that may be expensive or async:

- Filtering or sorting large collections
- Tab switches that mount heavy panels
- Client-side route transitions that keep old UI visible
- Re-rendering a dashboard when a filter chip changes

### The split in one sentence

> Keep the control urgent; make the consequence a transition.

---

## 6. `startTransition` in depth

`startTransition` lets you mark a state update (or a set of updates) as a transition:

```tsx
import { startTransition, useState } from "react";

function Search({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(items);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setQuery(next); // urgent: input stays snappy

    startTransition(() => {
      setResults(filterItems(items, next)); // non-urgent: may lag
    });
  }

  return (
    <>
      <input value={query} onChange={onChange} />
      <ResultList items={results} />
    </>
  );
}
```

### What React does with that

1. Schedules `setQuery` at urgent priority and commits soon.
2. Schedules `setResults` at transition priority.
3. May interrupt the results render if more keystrokes arrive.
4. Always applies transitions against the latest state when possible, so stale intermediate filters can be skipped.

### Nesting and batching notes

- Updates inside `startTransition` are still React state updates; they batch according to React’s normal rules for that context.
- If you call `startTransition` during render, that is a different (and usually wrong) pattern—keep it in event handlers, effects only when intentional, or in response to async completions.
- Transitions can wrap multiple `setState` calls; treat the wrapped block as one “non-urgent unit of navigation.”

### Async transitions

In React 19, transitions are commonly used with async work (for example, Actions). The important UX property remains: during the transition, React can keep showing the previous UI and expose pending state via `useTransition` / form status APIs.

```tsx
startTransition(async () => {
  await saveDraft(draft);
  // React keeps pending semantics for the transition scope
});
```

Prefer the documented Action patterns in your React version when integrating with forms and server functions; the scheduling idea is the same: mark the navigational/async update as a transition so the UI does not hard-block.

### When `startTransition` alone is not enough

`startTransition` does not magically make a 200ms synchronous loop cheap. If `filterItems` itself blocks the main thread with a tight CPU loop, you still need algorithmic improvement, chunking, workers, or virtualization. Transitions help React **schedule around** expensive renders; they do not eliminate JavaScript execution cost.

---

## 7. `useTransition`: pending UI that stays honest

`useTransition` is `startTransition` plus a pending flag:

```tsx
import { useState, useTransition } from "react";

function TabContainer() {
  const [tab, setTab] = useState<"home" | "posts" | "stats">("home");
  const [isPending, startTransition] = useTransition();

  function select(next: typeof tab) {
    startTransition(() => setTab(next));
  }

  return (
    <div data-pending={isPending ? "" : undefined}>
      <nav>
        <button onClick={() => select("home")}>Home</button>
        <button onClick={() => select("posts")}>Posts</button>
        <button onClick={() => select("stats")}>Stats</button>
      </nav>
      {isPending ? <p className="pending">Updating…</p> : null}
      <TabPanel id={tab} />
    </div>
  );
}
```

### Why pending exists

Without a pending signal, a transition can feel broken: the user clicked “Stats,” but the old tab is still visible for a few frames or hundreds of milliseconds. Pending UI answers: “We heard you; the destination is still preparing.”

Good pending treatments:

- Dim the outgoing content slightly
- Show a thin progress bar
- Mark the clicked tab as selected in the chrome while content catches up
- Avoid blanking the whole page if the previous content is still useful

### Pending is scoped to the transition

`isPending` becomes `true` when that hook’s `startTransition` has in-flight work, and returns to `false` when React finishes the transition update (including Suspense retries that are part of it). It is not a global “anything is loading” bit unless you design it that way.

### Composition tip

Lift `useTransition` to the component that owns the navigation affordance (tabs, filters, route switcher). Pass `startTransition` down if children need to trigger the same pending scope. That keeps one pending story for one user intention.

---

## 8. Suspense: boundaries, fallbacks, and reveal

`<Suspense>` declares a **boundary** around UI that may not be ready yet. While a child suspends, React shows the boundary’s `fallback`. When the child is ready, React reveals the content.

```tsx
import { Suspense } from "react";

export function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HeavyPanel />
    </Suspense>
  );
}
```

### What “suspend” means

A component suspends when it throws a special thenable (promise-like) that React understands. That can come from:

- `React.lazy` code splitting
- Data libraries integrated with Suspense
- `use()` on a promise in supported contexts
- Framework streaming mechanisms that coordinate with Suspense on the server and client

Suspense is not only a spinner component. It is a **coordination protocol** for incomplete UI subtrees.

### Boundary placement is a product decision

Where you put Suspense changes the UX:

| Placement | User experience |
| --- | --- |
| One boundary around the whole page | One big flash of fallback, then everything appears |
| Boundaries around independent widgets | Panels populate as they are ready |
| Boundary around only the slow leaf | Shell stays visible; leaf swaps from skeleton to content |

In general, prefer **shell first, holes later**: render navigation, layout, and titles outside Suspense; suspend only the parts that truly wait on async dependencies.

### Nested boundaries

Nested Suspense boundaries reveal independently (with some coordination around transitions—covered below). Inner boundaries let you avoid replacing a large already-visible region when a small child is still loading.

```tsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<ListSkeleton />}>
    <ItemList />
  </Suspense>
  <Suspense fallback={<AsideSkeleton />}>
    <Aside />
  </Suspense>
</Suspense>
```

### Avoid layout thrash in fallbacks

Fallbacks should roughly match the geometry of the final content when possible. A 40px skeleton that becomes a 400px panel causes CLS-like jumps and makes streaming feel shakier than it is.

---

## 9. Suspense for data, code, and streaming

### Code splitting with `lazy`

```tsx
import { lazy, Suspense } from "react";

const Editor = lazy(() => import("./Editor"));

export function Screen() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <Editor />
    </Suspense>
  );
}
```

This remains one of the clearest Suspense use cases: the boundary stays until the chunk loads.

### Data with Suspense-aware reading

The modern direction is “read data as if it is already there; if not, suspend.” Libraries and frameworks differ in API shape, but the React-facing behavior is similar: missing data suspends to the nearest boundary.

With React’s `use` API (when reading a promise):

```tsx
import { use, Suspense } from "react";

function ProjectName({ projectPromise }: { projectPromise: Promise<Project> }) {
  const project = use(projectPromise);
  return <h1>{project.name}</h1>;
}

export function Projects({ projectPromise }: { projectPromise: Promise<Project> }) {
  return (
    <Suspense fallback={<h1>Loading project…</h1>}>
      <ProjectName projectPromise={projectPromise} />
    </Suspense>
  );
}
```

Create the promise higher in the tree (or in your framework’s data layer) so you do not restart requests on every render accidentally.

### Streaming SSR and selective hydration

On the server, Suspense boundaries are also streaming seams: HTML for ready content can flush early, while fallbacks occupy the unfinished holes. On the client, React can hydrate interactive parts preferentially—another reason boundaries around independent regions help perceived performance.

In Next.js App Router, `loading.js` and explicit `<Suspense>` boundaries participate in this streaming story. Treat them as intentional UX structure, not only as framework ceremony.

### Suspense lists and reveal order

When multiple siblings suspend, reveal order and whether to show nested fallbacks can affect perceived polish. Prefer fewer, well-placed boundaries over a deep stack of spinners that pop in sequence and distract.

### Suspense + transitions: “wait, don’t flicker”

A crucial concurrent interaction: if a transition causes a component to suspend, React can **keep showing the old UI** instead of immediately flipping the boundary to fallback—while `isPending` stays true. That prevents “flash of skeleton” when navigating between cached and uncached states.

This is one of the strongest arguments for using transitions for navigations that may suspend.

---

## 10. `useDeferredValue`: keep showing yesterday while computing today

`useDeferredValue` returns a deferred version of a value that may “lag behind” the urgent value during concurrent rendering.

```tsx
import { useState, useDeferredValue, memo } from "react";

const ResultList = memo(function ResultList({ query }: { query: string }) {
  const items = searchHugeIndex(query); // expensive
  return <List items={items} />;
});

export function SearchBox() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const isStale = query !== deferredQuery;

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.7 : 1 }}>
        <ResultList query={deferredQuery} />
      </div>
    </div>
  );
}
```

### What is happening

1. `query` updates urgently on each keystroke → input stays current.
2. `deferredQuery` trails behind when React is under load.
3. `ResultList` re-renders against the deferred value, so expensive work is interruptible and deprioritized.
4. Comparing `query !== deferredQuery` gives you a lightweight pending/stale indicator.

### Initial render behavior

On the first render, the deferred value is the provided value (there is nothing to lag behind yet). Deferral matters when values change under contention.

### Stale UI is a feature

Showing slightly stale results during fast typing is usually better than blocking the input. Dim the stale panel or show a subtle “updating” cue so users understand the lag is intentional.

### Memoize the heavy child

If the child that reads the deferred value is not isolated, parents may still do expensive work. Structure the tree so the costly subtree primarily depends on the deferred value, and keep it pure/`memo`-friendly (or compiler-friendly) so React can skip it when the deferred input is unchanged.

---

## 11. Choosing between transitions and deferred values

Both features reduce urgency. They shine in different shapes of state ownership.

### Prefer `useTransition` / `startTransition` when:

- You control the `setState` that triggers the heavy update
- You are switching a selected tab, page segment, or filter ownership in the parent
- You need a pending flag tied to that intentional update
- The update may suspend and you want to avoid fallback flicker

### Prefer `useDeferredValue` when:

- You receive a fast-changing value as a prop or from urgent local state
- You cannot easily wrap the upstream `setState` in a transition
- You want the child to lag based on a derived/prop value
- You are decorating an existing controlled input without restructuring state updates

### Side-by-side sketch

```tsx
// Transition-owned update
startTransition(() => setFilter(nextFilter));

// Deferred-owned derivation
const deferredFilter = useDeferredValue(filter);
```

### Combining them

You usually do not need both on the same value. Combining can make pending semantics harder to explain. Pick the tool that matches where the urgency split lives:

- Split at the **writer** → transition
- Split at the **reader** → deferred value

---

## 12. Scheduling: how React shares the main thread

React’s scheduler cooperates with the browser event loop. The simplified story:

1. An update is scheduled at some priority.
2. React performs render work in slices when time is available.
3. If time runs out or a higher-priority update appears, React yields.
4. When a render completes, React commits and the browser paints.
5. Effects run after paint according to React’s effect rules.

### Yielding is about responsiveness

Yielding lets the browser:

- Process input events
- Run rAF callbacks
- Paint frames
- Perform other tasks queued on the main thread

Without yielding, a 100ms render means ~100ms of dead UI time.

### Collaboration with your own scheduling

If you schedule work yourself (`setTimeout`, `requestIdleCallback`, workers), you are sharing the same main thread (except workers). Guidelines:

- Do not fight React with aggressive busy loops.
- Prefer breaking huge computations into chunks or moving them off-thread.
- Use transitions/deferred values for **React render work**; use workers for **raw data transformation** when payloads are large.

### `flushSync` and escaping the model

`flushSync` forces synchronous flush of updates—useful for rare DOM measurement cases, harmful as a default. It intentionally opts out of the cooperative scheduling benefits. Treat it like a sharp tool.

### Measurement mindset

When profiling:

- Distinguish **input delay** (event to handler/paint of the control) from **update latency** (event to final content).
- Transitions often improve input delay while leaving update latency similar or slightly higher—and that trade is usually correct.
- Watch for accidental urgent renders of huge lists; concurrency cannot hide O(n) DOM thrash forever.

---

## 13. Combining the tools in real UIs

### Pattern A: Search-as-you-type

**Goal:** Input never stutters; results may lag.

Options:

1. Urgent `query` + `startTransition` to set `results`
2. Urgent `query` + `useDeferredValue(query)` into a memoized results list

Add a stale/pending visual. Keep the filter function reasonably efficient; virtualize if the DOM list is huge.

### Pattern B: Tabbed inspector

**Goal:** Clicked tab highlights immediately; panel content may suspend.

```tsx
const [isPending, startTransition] = useTransition();
const [tab, setTab] = useState("a");
const [visualTab, setVisualTab] = useState("a");

function onSelect(next: string) {
  setVisualTab(next); // urgent chrome
  startTransition(() => setTab(next)); // content transition
}

return (
  <>
    <Tabs value={visualTab} pending={isPending} onChange={onSelect} />
    <Suspense fallback={<PanelSkeleton />}>
      <Panel id={tab} />
    </Suspense>
  </>
);
```

Often you can drive chrome from the same transition pending state without a second piece of state—adjust to taste.

### Pattern C: Filter chips driving a dashboard

**Goal:** Chips respond instantly; charts update as a transition.

Put `startTransition` around the dashboard’s filter state. Wrap slow chart islands in Suspense with skeletons that match chart dimensions. Consider deferring only the heaviest derived series if chip state must remain local and urgent.

### Pattern D: Client navigation with retained UI

**Goal:** Soft-navigate without blanking.

Framework routers increasingly model navigations as transitions. If you hand-roll view switching, wrap the view ID update in `startTransition` and keep a layout shell outside Suspense.

### Pattern E: Optimistic control, deferred confirmation

**Goal:** Toggle feels instant; server confirmation trails.

Optimistic UI is related but distinct: you urgently update local state, then reconcile with server result. Use transitions for the reconciliation/navigation side effects when they are heavy; keep the optimistic control urgent.

---

## 14. Patterns that work well in Next.js

This repository uses Next.js App Router concepts built on React’s concurrent model. A few practical alignments:

### Use Suspense as streaming structure

- Place static shell content outside boundaries.
- Use `loading.js` for segment-level fallbacks when the whole segment waits.
- Use granular `<Suspense>` for independent widgets (sidebars, comments, charts).

### Keep client interactivity intentional

Client Components that call `useSearchParams` or other dynamic APIs may force client rendering up to the nearest Suspense boundary during prerendering. Wrap those components tightly so the rest of the page can still prerender/stream cleanly.

### Prefer transitions for local heavy UI state

Even when data is fetched on the server, client-side filter/sort/tab behavior still benefits from `useTransition` and `useDeferredValue`.

### Do not confuse Server Components with concurrency

Server Components reduce client JS and can stream output; concurrent features govern how React schedules and reveals UI (especially on the client, and during hydration). They complement each other: RSC + Suspense streaming for network/IO structure; transitions/deferred values for interaction under CPU load.

### Partial prerendering mental model

Where Partial Prerendering (or equivalent static shell + dynamic holes) is enabled, Suspense boundaries are the seams between the shell and dynamic content. Designing good boundaries is both a performance and a product design task.

---

## 15. Debugging concurrent behavior

### What “bugs” look like

Concurrent issues often present as UX confusion rather than thrown exceptions:

- Input feels delayed (update was not actually deferred/transitioned)
- Clicked tab does not appear selected while content loads (missing pending chrome)
- Skeleton flashes on every keystroke (urgent update suspends without transition)
- Results feel random (derived work uses non-deferred urgent value and drops frames)
- Double-fetching (promise recreated every render while suspending)

### Tools and techniques

1. **React Profiler** — Identify long commits and which components re-render.
2. **Pending/stale flags in the UI** — Temporarily surface `isPending` and `value !== deferred` to verify scheduling intent.
3. **Strip work** — Replace expensive children with CPU stubs to see if the issue is scheduling or raw cost.
4. **Check boundary placement** — Confirm which Suspense fallback can appear for a given suspend.
5. **Verify memoization boundaries** — Ensure deferred values actually gate the expensive subtree.

### A minimal instrumentation habit

```tsx
const deferredQuery = useDeferredValue(query);
if (process.env.NODE_ENV === "development") {
  if (query !== deferredQuery) {
    console.debug("deferred lag", { query, deferredQuery });
  }
}
```

Remove or gate noisy logs before shipping.

---

## 16. Common pitfalls and anti-patterns

### 1. Wrapping the input itself in a transition

```tsx
// Usually wrong: makes typing feel laggy
startTransition(() => setQuery(e.target.value));
```

Keep the control urgent; transition the consequences.

### 2. Expecting transitions to fix O(n²) renders

Concurrency schedules work; it does not change asymptotics. Fix list keys, avoid accidental full-tree remounts, virtualize, and reduce props churn.

### 3. Suspense without a useful fallback

`fallback={null}` can be correct for tiny holes, but for primary content it feels like a freeze. Prefer skeletons with reserved space.

### 4. Giant single boundary

One page-wide Suspense turns streaming into a single late reveal. Split by independent async regions.

### 5. Recreating promises on every render

If a child suspends on a promise created inline in the parent render, you can thrash. Stabilize promise identity via data loaders, caching, or lifting creation outside render.

### 6. Using deferred values and then reading the urgent value in the same heavy child

That reintroduces urgent expensive work. Pass only the deferred value into the heavy child.

### 7. Overusing `flushSync`

It disables the benefits you are trying to learn in this tutorial. Reserve it for known integration cases (e.g., measuring DOM after forced update).

### 8. Treating `isPending` as global network state

It tracks transition pending state for that hook, not all fetches. Use your data library’s status for remote loading, and transitions for React update urgency.

### 9. Accessibility afterthoughts

Pending regions should be announced thoughtfully (`aria-busy`, live regions where appropriate) without spamming announcements on every keystroke. Prefer announcing tab/page transitions, not each deferred keystroke lag.

---

## 17. A decision checklist

Use this when implementing an interactive surface:

1. **What must feel instant?** Mark those state updates urgent (default).
2. **What is the expensive consequence?** Wrap writer updates in `startTransition` or read via `useDeferredValue`.
3. **Might it suspend?** Pair navigational transitions with Suspense so old UI can remain until ready.
4. **Where are the holes?** Place Suspense boundaries around independent async units; keep the shell outside.
5. **How do we show progress?** `isPending`, stale opacity, skeletons with stable layout.
6. **Is the work inherently too large?** Add virtualization, chunking, caching, or workers.
7. **Did we verify with profiling?** Confirm input delay improved and commits make sense.

### Quick chooser

| Situation | Reach for |
| --- | --- |
| Controlled input + heavy results | Transition on results **or** `useDeferredValue` into results |
| Tab/page switch that may suspend | `useTransition` + Suspense |
| Streaming server holes | Suspense boundaries / `loading.js` |
| Prop from parent changes too fast | `useDeferredValue` in the child |
| Rare DOM measure requiring sync flush | `flushSync` (sparingly) |

---

## 18. Further reading and practice exercises

### Concepts to re-read on react.dev

- `startTransition`
- `useTransition`
- `useDeferredValue`
- `<Suspense>`
- `<Activity>` / related visibility APIs when relevant to your React version
- `use` for reading promises/resources

### Practice exercises (do these in a sandbox)

1. **Cold start search:** Build a 10k-item filter list. Compare no concurrency vs transition vs deferred value. Measure typing responsiveness subjectively and with Performance panel long tasks.
2. **Suspense flicker lab:** Navigate between two lazy tabs with and without `startTransition`. Observe fallback flashing.
3. **Boundary sculpture:** Take a dashboard with three slow panels; move from one outer Suspense to three inner ones; compare perceived load.
4. **Stale styling:** Drive opacity from `query !== deferredQuery` and tune until lag is understandable, not alarming.
5. **Pending chrome:** Make tabs update selection chrome urgently while panel content transitions.

### Production checklist before you ship

- Pending/stale UI is visible for slow transitions
- Fallbacks reserve layout space
- No accidental urgent heavy renders on each keystroke
- Promises/resources are not recreated carelessly
- Profiler shows improved input responsiveness under load

---

## Closing mental model

Concurrent React asks you to design **urgency** explicitly:

- **Urgent:** the user’s immediate manipulation of controls
- **Transitional:** the application’s journey to a new view
- **Deferred:** derived values allowed to lag so urgent UI stays honest
- **Suspended:** UI units waiting on dependencies, revealed through boundaries
- **Scheduled:** render work that yields so the browser can remain interactive

When those five ideas line up with your product’s feedback clocks, interfaces feel calm under stress—not because work disappeared, but because React was allowed to prioritize the work that preserves trust in the moment of interaction.

Build the shell first. Keep controls urgent. Mark navigations as transitions. Defer heavy derived reads. Suspend at intentional seams. Then profile, and only then micro-optimize.

That is the concurrent rendering workflow end to end.
