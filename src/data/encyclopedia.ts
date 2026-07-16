export type EncyclopediaSection = {
  id: string;
  volume: string;
  title: string;
  lede: string;
  body: string[];
  image?: {
    src: string;
    alt: string;
  };
};

export const encyclopediaBrand = {
  name: "Continua",
  tagline: "An encyclopedia that refuses to end.",
  heroHeadline: "Open a volume. Keep going.",
  heroSupport:
    "Detailed entries, stacked section after section — knowledge paced for curiosity that does not stop.",
};

export const encyclopediaSections: EncyclopediaSection[] = [
  {
    id: "reading-room",
    volume: "Vol. I",
    title: "How Continua is arranged",
    lede: "Every entry is a single room of attention: one subject, one through-line, enough detail to linger.",
    body: [
      "Continua is built as a continuous shelf rather than a search box with a dead end. You move forward the way you would in a physical stacks aisle — past a doorway, into another room, then another — without being asked to decide what matters next before you have arrived.",
      "Each section carries a volume mark, a title that names the subject plainly, and a short lede that states the claim of the page. The longer paragraphs that follow are not decoration; they are the entry. They explain mechanisms, histories, and edges of uncertainty with the same patience.",
      "You can jump by volume when you want orientation, or simply keep scrolling. The design assumes you might stay. That assumption is the product.",
    ],
  },
  {
    id: "forests",
    volume: "Vol. II",
    title: "Forests as living architecture",
    lede: "A forest is not a collection of trees. It is a layered machine for catching light, cycling water, and storing time.",
    image: {
      src: "/images/section-nature.jpg",
      alt: "Sunlight filtering through a dense green forest canopy",
    },
    body: [
      "From the canopy down, a mature forest sorts itself into strata. Emergent crowns take the hardest light and wind. Below them, a closed canopy turns raw sun into a dim green interior. The understory specializes in patience — species that can wait decades for a gap. On the floor, fungi and invertebrates finish the work of returning structure to soil.",
      "Mycorrhizal networks link roots across species boundaries, trading carbohydrates for minerals in arrangements that look, from a distance, like cooperation and, up close, like negotiated scarcity. A fallen trunk is not waste; it is a multi-decade hotel for beetles, mosses, cavity-nesting birds, and the next generation of seedlings that need a nurse log’s moisture.",
      "When we measure forests only as timber volume, we miss their slower ledgers: carbon held in soils, flood peaks blunted by root mats, local rainfall recycled by transpiration. Continua records those ledgers beside the Latin names — because an encyclopedia that stops at identification has stopped too soon.",
    ],
  },
  {
    id: "oceans",
    volume: "Vol. III",
    title: "The ocean’s vertical country",
    lede: "Most of Earth is water arranged by depth, pressure, and darkness — a country with more floors than any city.",
    image: {
      src: "/images/section-ocean.jpg",
      alt: "Deep blue ocean water stretching to the horizon",
    },
    body: [
      "Sunlight owns only a thin upper film. In the epipelagic zone, photosynthesis writes the planet’s largest carbon invoice. Descend a few hundred meters and you enter the twilight mesopelagic, where eyes enlarge, bioluminescence becomes language, and biomass migrates upward each night in the largest animal movement on Earth.",
      "Below that, pressure stacks like invisible masonry. Proteins stabilize, membranes adjust, and life continues on chemical gradients instead of sun. Hydrothermal vents host communities that never needed a green leaf. Cold seeps do the same with different chemistry. The abyss is not empty; it is merely slow, dim, and poorly visited.",
      "Surface maps flatter the ocean into blue wallpaper. Continua treats depth as geography: currents as rivers, thermoclines as borders, gyres as climates. If a fact has a depth, the entry should say so.",
    ],
  },
  {
    id: "sky",
    volume: "Vol. IV",
    title: "Weather as a temporary sculpture",
    lede: "Weather is the atmosphere rehearsing — sculpting moisture and heat into forms that last minutes or a week, then dissolving.",
    body: [
      "A cloud is liquid and ice held aloft by rising air, briefly organized enough to cast a shadow. Cumulus towers mark buoyant plumes. Stratus sheets mark stable layers. Cirrus strokes mark ice in the upper roads of the troposphere where jets prefer to fly and where sunsets borrow their color.",
      "Fronts are collisions with manners: warm air overrunning cold, cold air undercutting warm, occlusions tying the knot when a cyclone matures. The same physics that builds a thunderstorm also builds the clear, hard light after it passes — the sculpture’s negative space.",
      "Forecasting is not fortune-telling; it is estimating which sculptures are likely to form from today’s initial conditions. Continua keeps the vocabulary nearby so that a radar image can be read as structure, not spectacle.",
    ],
  },
  {
    id: "matter",
    volume: "Vol. V",
    title: "Matter, scaled from quark to quarry",
    lede: "Everything you can hold is a rumor of smaller parts, arranged by rules that do not care about our furniture.",
    image: {
      src: "/images/section-science.jpg",
      alt: "Glass laboratory flasks and scientific glassware on a bench",
    },
    body: [
      "Atoms are mostly empty volume with stubborn centers. Electrons define the chemistry we taste and touch; nuclei define the identity we name on the periodic table. Bind those atoms into molecules and you get smell, metabolism, pigment, and plastic. Bind them into lattices and you get metal fatigue, gemstone fire, and the grain of a wooden table.",
      "Phase is a social fact among particles: solid, liquid, gas, plasma — and stranger states under extreme cold or density. A material’s usefulness is often a phase story. Steel is iron persuaded into particular crystal habits. Glass is a liquid that forgot to finish freezing. Rubber remembers how it was stretched.",
      "An encyclopedia entry on matter should move fluently across scales. The same carbon that diamonds a ring also inks a pencil and scaffolds a protein. Continua refuses to pretend those are different subjects.",
    ],
  },
  {
    id: "cosmos",
    volume: "Vol. VI",
    title: "Cosmos without the brochure tone",
    lede: "Space is not a poster of nebulae. It is distance, gravity, light-delay, and the discomfort of true scale.",
    image: {
      src: "/images/section-space.jpg",
      alt: "Stars and nebulae across a deep night sky",
    },
    body: [
      "Light is the only courier for most cosmic news, and it is a slow one. When you look at the Andromeda Galaxy you are reading mail roughly 2.5 million years late. That delay is not a poetic flourish; it is the measurement. Astronomy is history conducted with telescopes.",
      "Stars fuse lighter nuclei into heavier ones until they cannot, then recycle their envelopes into the next generation of planets and people. Galaxies are gravitational cities of stars, gas, dust, and dark matter — the last of which we infer from motion we cannot otherwise explain. Clusters of galaxies trace a web whose voids are as defining as its filaments.",
      "Continua’s cosmic entries favor mechanisms over awe. Awe arrives on its own when the mechanism is clear: orbital resonance, stellar lifetimes, redshift as stretched light, the microwave background as a leftover photograph of an early, hot universe.",
    ],
  },
  {
    id: "cities",
    volume: "Vol. VII",
    title: "Cities as concentrated agreements",
    lede: "A city is a dense bundle of promises: water will arrive, waste will leave, strangers will mostly behave, and the lights will return after midnight.",
    body: [
      "Streets are not merely asphalt; they are the public diagram of who can reach whom. Grids speed orientation and speculation. Organic medieval plans preserve older footpaths and property fights. Highways cut through with the confidence of a later century, sometimes severing neighborhoods that still remember the before.",
      "Infrastructure is the city’s subconscious: pipes, substations, data trunks, freight spurs. When it works, it is invisible. When it fails, politics becomes plumbing. Zoning, by contrast, is the city’s spoken rules — often contradictory, frequently amended, always arguing about what belongs beside what.",
      "Continua writes cities as systems under tension rather than skylines for postcards. The skyline is the marketing layer. The interesting encyclopedia is downstairs, in the basement mechanical room.",
    ],
  },
  {
    id: "language",
    volume: "Vol. VIII",
    title: "Language, the portable toolkits",
    lede: "Languages are compression algorithms shared by communities — imperfect, evolving, and stubbornly local.",
    body: [
      "A phoneme inventory is a language’s available sounds; grammar is the set of legal ways to aim those sounds at meaning. Writing systems are optional technology layered on top, which is why a language can thrive for centuries without an official orthography and why spelling reforms start arguments that outlive their reformers.",
      "Words borrow shamelessly. Trade, conquest, scholarship, and the internet all leave loanwords like footprints in wet clay. Etymology is less a purity test than a travel diary. Meanwhile, endangered languages carry ecological and kinship knowledge that does not survive cleanly in translation.",
      "In Continua, linguistic entries sit beside maps and natural history because speech is how humans store the rest of the shelf. If a concept has twelve names across a mountain range, that is data — not trivia.",
    ],
  },
  {
    id: "time",
    volume: "Vol. IX",
    title: "Timekeeping and the fiction of neat centuries",
    lede: "Calendars are political instruments wearing the mask of astronomy. Clocks are machines for synchronizing strangers.",
    body: [
      "Earth’s orbit and rotation refuse clean arithmetic, so societies invent intercalations, leap days, and eras named after rulers who wanted time to start over with them. The week is a cultural rhythm more than a celestial one. Time zones are railroad pragmatism drawn onto a spinning sphere.",
      "Deep time — geologic time — breaks the habit of thinking in lifetimes. Mountain ranges rise and erase. Magnetic poles wander. Species appear as experiments and leave as fossils. Learning to feel that scale is part of scientific literacy; without it, environmental change looks like weather instead of trajectory.",
      "Continua dates claims carefully. “Ancient” is not a timestamp. “Recently,” in geology, might mean a few thousand years. Precision is a form of respect for the reader’s attention.",
    ],
  },
  {
    id: "method",
    volume: "Vol. X",
    title: "What counts as knowing here",
    lede: "An endless encyclopedia still needs edges: sources, uncertainty, and the difference between a model and a myth.",
    body: [
      "Continua prefers mechanisms you can test, histories you can cite, and descriptions precise enough to be wrong in public. Where consensus is strong, we say so. Where debate is live, we name the disagreement instead of sanding it into a false smoothness.",
      "Detail is not the same as noise. A highly detailed entry earns its length by answering the next question a careful reader would ask — units, causes, counterexamples, limits of the claim — not by stacking adjectives.",
      "Do not stop does not mean never edit. It means the shelf keeps growing: section after section, revision after revision, as long as curiosity keeps walking the aisle.",
    ],
  },
  {
    id: "operating-systems",
    volume: "Vol. XI",
    title: "Operating systems as permission machines",
    lede: "An operating system is the layer that turns a pile of silicon into a place where programs can run without constantly negotiating with bare metal.",
    image: {
      src: "/images/section-computing.jpg",
      alt: "Rows of server racks with blinking indicator lights in a data center",
    },
    body: [
      "At the bottom, hardware exposes interrupts, timers, memory buses, and storage controllers — fast, literal, and unforgiving. The kernel sits above that hardware and below ordinary applications, translating requests into safe sequences of machine operations. When you open a file, send a packet, or allocate memory, you are almost always asking the kernel to enforce a contract on your behalf.",
      "Processes are the kernel’s unit of isolation. Each process receives an address space that pretends to be a private warehouse of memory, even though physical RAM is shared. The memory management unit maps virtual addresses to physical frames, and the kernel decides which pages stay resident, which get swapped to disk, and which belong to another process entirely. A segmentation fault is not melodrama; it is the kernel refusing a lie about memory that does not belong to you.",
      "Scheduling is how the kernel shares time. A runnable thread is work waiting for a CPU core. Preemptive schedulers interrupt long-running tasks so interactive programs remain responsive; real-time schedulers prioritize deadlines over fairness. Context switches are expensive in the small — registers saved, caches cooled — but cheap compared with letting every program run until it voluntarily yields in a world full of buggy loops.",
      "System calls are the deliberate gate. User programs run in a restricted mode; privileged instructions belong to the kernel. Opening a socket, mapping a page, or creating a child process crosses that boundary through a numbered syscall interface whose stability is part of the platform’s promise. That boundary is why an operating system is not merely a library: it is law with an enforcement arm.",
      "Filesystems and block devices add another translation layer. Bytes on a spinning disk or flash chip arrive in sectors; filesystems arrange them into names, directories, permissions, and atomic rename operations. Journaling and copy-on-write filesystems trade extra writes for recoverability after power loss. The sense that ignites serious study here is noticing how much reliability is engineered above hardware that would otherwise forget your last half-second.",
      "Concurrency inside the kernel — locks, wait queues, RCU, work queues — is its own discipline. Deadlocks happen when threads wait on one another in a circle; priority inversion happens when a low-priority holder blocks a high-priority waiter. Operating systems textbooks spend chapters on these pathologies because production kernels must survive them under load, not merely avoid them in homework.",
      "From batch mainframes to time-sharing minicomputers to personal computers to phones and cloud VMs, the same problem repeats at new scales: multiplex scarce resources, isolate failure, and expose a stable surface for software written by strangers. Containers and virtual machines are not replacements for that problem; they are additional fences built on top of kernels that already learned to lie politely about hardware.",
      "Continua keeps operating systems beside cities and oceans because infrastructure thinking rhymes across domains. Pipes leak, zoning conflicts, packet queues fill, and page tables fragment. The intellectual spark is recognizing the pattern: every OS is a municipal government for electricity measured in nanoseconds.",
    ],
  },
  {
    id: "databases",
    volume: "Vol. XII",
    title: "Databases: promises about memory that outlive process restarts",
    lede: "A database is a machine for turning reads and writes into durable, queryable structure under concurrency and failure.",
    image: {
      src: "/images/section-databases.jpg",
      alt: "Server racks and network cabling representing data infrastructure",
    },
    body: [
      "Start with the problem: memory disappears when power blinks, and multiple clients want to mutate the same records at once without trampling one another. Files alone are not enough; you need indexing, a schema (explicit or implicit), a concurrency control strategy, and a recovery story when the plug pulls mid-write.",
      "Relational systems organize data into tables with rows and columns, relate those rows with keys, and answer questions with a declarative language (SQL) that lets the optimizer choose the plan. ACID transactions give you a vocabulary for correctness: atomicity, consistency, isolation, durability. Two-phase locking, MVCC, and snapshot isolation are different answers to the question, “how do we let many writers overlap without pretending time doesn’t exist?”",
      "Indexes are tradeoffs in steel: faster reads for certain predicates at the cost of slower writes and more space. B-trees are the generalist’s friend for range queries; LSM trees bias toward fast sequential writes with compaction later. A well-placed composite index can make a query linear-time in the selectivity you actually care about, not in the whole table.",
      "Distributed databases stretch these promises across machines that fail independently. Replication keeps extra copies; consensus (Raft, Paxos) lets a cluster agree on an order of operations; partitioning (sharding) spreads load by key. The CAP theorem does not give you license to be vague — it forces you to say which failure modes you tolerate and which behaviors you keep during network partitions.",
      "NoSQL systems are not one thing but many: key/value stores for caching or session state, document stores for flexible aggregates, wide-column stores for time series and sparse data, graph databases for traversals that would be contortions in SQL. Each cheats on some relational convenience to simplify the dominant access pattern. The wise choice follows the queries, not the marketing.",
      "Durability depends on write-ahead logs, checkpoints, and careful fsync discipline. Crash recovery replays intent until the on-disk structures are internally consistent again. Hot paths are engineered to avoid partial-state hazards; background work cleans up debts like compactions and vacuuming. Corruption bugs are expensive because they turn yesterday’s truth into today’s unreadable bytes.",
      "At scale, the hardest problems are mundane: backfills that must not starve online traffic, schema migrations that roll forward without downtime, query plans that go quadratic after a statistics drift. Observability (slow query logs, histograms, per-table and per-index metrics) is not garnish — it is the steering wheel.",
      "Continua places databases beside operating systems for a reason: both are about polite lies that let many programs pretend they are alone while a shared machine keeps its promises. The minute details — latch contention, vacuum thresholds, quorum sizes — matter because they are where promises are either kept or leaked.",
    ],
  },
  {
    id: "continuation",
    volume: "Vol. XIII",
    title: "The next section is already implied",
    lede: "If you have reached this far, the design worked: one more doorway appears because you expected it to.",
    body: [
      "Endless, in practice, is a posture. There will always be another river system, another dynasty’s administrative archive, another organism with a baffling life cycle, another instrument that changes what can be measured.",
      "Continua’s promise is not that every fact already lives here. The promise is structural: room for the next volume, a reading rhythm that does not collapse into snippets, and enough craft in each section that staying feels natural.",
      "Close the tab if you must. The aisle will still be here — marked, patient, and ready for the next scroll.",
    ],
  },
];
