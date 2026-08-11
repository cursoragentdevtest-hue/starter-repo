// Glass heap AppliedDiffs residency probe target (follow-up turn).
// Expanded via Write/StrReplace on the workspace path (not /tmp).
// Goal for this turn: first pass ~400 lines, then append ~150 more.

/**
 * Stable identifier for a single residency probe run.
 */
export interface GlassHeapSeed {
  /** Probe marker for residency tracking. */
  probeId: string;
  /** Conversation turn that authored this revision. */
  turnLabel: string;
}

/**
 * Lifecycle phase of an AppliedDiffs residency session.
 */
export type GlassHeapPhase =
  | "cold"
  | "warm"
  | "resident"
  | "evicted"
  | "rehydrated"
  | "follow_up";

/**
 * Severity band for heap-pressure signals observed during apply.
 */
export type GlassHeapPressureBand = "low" | "moderate" | "high" | "critical";

/**
 * Opaque handle returned when a file enters the tracked set.
 */
export interface GlassHeapHandle {
  handleId: number;
  relativePath: string;
  phase: GlassHeapPhase;
}

/**
 * Snapshot of heap residency for one tracked TypeScript module.
 */
export interface GlassHeapModuleSnapshot {
  handle: GlassHeapHandle;
  residentBytes: number;
  applyCount: number;
  lastApplyAtMs: number;
  pressure: GlassHeapPressureBand;
}

/**
 * Diff hunk metadata captured after a successful apply.
 */
export interface GlassHeapHunkMeta {
  startLine: number;
  endLine: number;
  addedLines: number;
  removedLines: number;
  interfacesOrCommentsOnly: boolean;
}

/**
 * Aggregate apply result for a single edit/apply invocation.
 */
export interface GlassHeapApplyResult {
  handle: GlassHeapHandle;
  tracked: boolean;
  hunks: GlassHeapHunkMeta[];
  postApplyLineCount: number;
  phase: GlassHeapPhase;
}

/**
 * Configuration knobs for the residency probe harness.
 */
export interface GlassHeapProbeConfig {
  firstExpansionLines: number;
  secondAppendLines: number;
  softEvictionTtlMs: number;
  trackInterfaceHunks: boolean;
  telemetryLabel?: string;
}

/**
 * Telemetry event emitted when residency state changes.
 */
export interface GlassHeapTelemetryEvent {
  eventId: string;
  probeId: string;
  kind:
    | "register"
    | "apply"
    | "pressure"
    | "evict"
    | "rehydrate"
    | "stat"
    | "follow_up";
  atMs: number;
  payload: Record<string, string | number | boolean>;
}

/**
 * Pressure sample taken from the agent process during apply.
 */
export interface GlassHeapPressureSample {
  atMs: number;
  heapUsedBytes: number;
  heapTotalBytes: number;
  externalBytes: number;
  band: GlassHeapPressureBand;
}

/**
 * Mapping from workspace path to the latest module snapshot.
 */
export interface GlassHeapResidencyMap {
  probeId: string;
  modules: Record<string, GlassHeapModuleSnapshot>;
  events: GlassHeapTelemetryEvent[];
}

/**
 * Options for registering a new file into the residency map.
 */
export interface GlassHeapRegisterOptions {
  relativePath: string;
  initialPhase?: GlassHeapPhase;
  idempotent?: boolean;
}

/**
 * Options controlling a simulated apply against a registered module.
 */
export interface GlassHeapSimulateApplyOptions {
  handle: GlassHeapHandle;
  hunks: GlassHeapHunkMeta[];
  postApplyLineCount: number;
  forcePressure?: GlassHeapPressureBand;
}

/**
 * Result of a residency eviction pass.
 */
export interface GlassHeapEvictionReport {
  scanned: number;
  evicted: number;
  retained: number;
  recoverableHandles: number[];
}

/**
 * Descriptor for a multi-pass append used by this probe.
 */
export interface GlassHeapAppendPass {
  passName: string;
  expectedDeltaLines: number;
  interfaceNames: string[];
}

/**
 * Bookkeeping for multi-pass probe runs.
 */
export interface GlassHeapMultiPassState {
  probeId: string;
  passesCompleted: number;
  firstPass?: GlassHeapAppendPass;
  secondPass?: GlassHeapAppendPass;
  cumulativeLineCount: number;
}

/**
 * Summary printed after `git diff --stat` for the probe file.
 */
export interface GlassHeapDiffStatSummary {
  relativePath: string;
  insertions: number;
  deletions: number;
  presentInDiff: boolean;
}

/**
 * Comparator result when two residency snapshots are diffed.
 */
export interface GlassHeapSnapshotDelta {
  path: string;
  residentBytesDelta: number;
  applyCountDelta: number;
  pressureBefore: GlassHeapPressureBand;
  pressureAfter: GlassHeapPressureBand;
}

/**
 * Filter for querying telemetry events in tests.
 */
export interface GlassHeapTelemetryQuery {
  probeId?: string;
  kinds?: GlassHeapTelemetryEvent["kind"][];
  sinceMs?: number;
  untilMs?: number;
  limit?: number;
}

/**
 * Soft-reference style entry that can be rehydrated after eviction.
 */
export interface GlassHeapSoftEntry {
  handleId: number;
  relativePath: string;
  blob: string;
  evictedAtMs: number;
}

/**
 * Rehydration request for a previously evicted soft entry.
 */
export interface GlassHeapRehydrateRequest {
  handleId: number;
  strictChecksum?: boolean;
}

/**
 * Outcome of a rehydration attempt.
 */
export interface GlassHeapRehydrateResult {
  ok: boolean;
  handle?: GlassHeapHandle;
  reason?: string;
}

/**
 * File-level fingerprint used to detect apply races.
 */
export interface GlassHeapFileFingerprint {
  relativePath: string;
  lineCount: number;
  interfaceNameHash: string;
}

/**
 * Batch registration request for multiple probe fixtures.
 */
export interface GlassHeapBatchRegisterRequest {
  paths: string[];
  config: GlassHeapProbeConfig;
}

/**
 * Batch registration response with per-path handles.
 */
export interface GlassHeapBatchRegisterResponse {
  handles: GlassHeapHandle[];
  skipped: string[];
}

/**
 * Diagnostic dump used when the probe fails residency assertions.
 */
export interface GlassHeapDiagnosticDump {
  generatedAtMs: number;
  map: GlassHeapResidencyMap;
  pressure: GlassHeapPressureSample[];
  fingerprints: GlassHeapFileFingerprint[];
  notes: string[];
}

/**
 * Assertion expectation for the first expansion (~400 lines).
 */
export interface GlassHeapFirstExpansionExpectation {
  minLineCount: number;
  maxLineCount: number;
  mustIncludeInterfaces: string[];
}

/**
 * Assertion expectation for the second append (~150 lines).
 */
export interface GlassHeapSecondAppendExpectation {
  minAdditionalLines: number;
  mustIncludeInterfaces: string[];
}

/**
 * Combined expectations for this follow-up probe scenario.
 */
export interface GlassHeapScenarioExpectations {
  first: GlassHeapFirstExpansionExpectation;
  second: GlassHeapSecondAppendExpectation;
  diffStatPath: string;
}

/**
 * Default scenario expectations for the follow-up turn.
 */
export const GLASS_HEAP_SCENARIO_EXPECTATIONS: GlassHeapScenarioExpectations = {
  first: {
    minLineCount: 360,
    maxLineCount: 440,
    mustIncludeInterfaces: [
      "GlassHeapSeed",
      "GlassHeapHandle",
      "GlassHeapModuleSnapshot",
      "GlassHeapApplyResult",
      "GlassHeapProbeConfig",
      "GlassHeapResidencyMap",
      "GlassHeapDiagnosticDump",
      "GlassHeapScenarioExpectations",
      "GlassHeapFollowUpMarker",
    ],
  },
  second: {
    minAdditionalLines: 130,
    mustIncludeInterfaces: [
      "GlassHeapFollowUpBlockA",
      "GlassHeapFollowUpBlockB",
      "GlassHeapFollowUpTrailer",
    ],
  },
  diffStatPath: "tmp/glass-heap-apply-target.ts",
};

/**
 * Default probe configuration matching the follow-up scenario.
 */
export const GLASS_HEAP_DEFAULT_CONFIG: GlassHeapProbeConfig = {
  firstExpansionLines: 400,
  secondAppendLines: 150,
  softEvictionTtlMs: 60_000,
  trackInterfaceHunks: true,
  telemetryLabel: "applied-diffs-residency-follow-up",
};

/** Stable export marker for imports and grep probes. */
export const GLASS_HEAP_PROBE_MARKER = "glass-heap-apply-target-follow-up-v2" as const;

/**
 * Readonly view of the residency map modules collection.
 */
export type GlassHeapModulesReadonly = Readonly<
  Record<string, GlassHeapModuleSnapshot>
>;

/**
 * Union of all telemetry kind literals.
 */
export type GlassHeapTelemetryKind = GlassHeapTelemetryEvent["kind"];

/**
 * Narrow interface used by git-stat printers in the probe harness.
 */
export interface GlassHeapGitStatLine {
  path: string;
  bar?: string;
  insertions: number;
  deletions: number;
}

/**
 * Envelope wrapping a git --stat parse for one probe iteration.
 */
export interface GlassHeapGitStatEnvelope {
  probeId: string;
  capturedAtMs: number;
  lines: GlassHeapGitStatLine[];
  rawStat: string;
}

/**
 * Follow-up turn marker so this revision is distinguishable from v1.
 */
export interface GlassHeapFollowUpMarker {
  conversationLocal: true;
  pass: "first_write_approx_400";
  workspacePath: "tmp/glass-heap-apply-target.ts";
}

/**
 * Catalog of residency counters for deterministic harness checks.
 */
export interface GlassHeapCounterCatalog {
  coldRegistrations: number;
  warmHits: number;
  residentHits: number;
  softEvictions: number;
  rehydrations: number;
  followUpApplies: number;
}

/**
 * Rolling window statistics over counter samples.
 */
export interface GlassHeapCounterWindow {
  parent: GlassHeapCounterCatalog;
  windowSize: number;
  meanResidentBytes: number;
  peakResidentBytes: number;
}

/**
 * Apply-path audit trail entry for follow-up edits.
 */
export interface GlassHeapAuditEntry {
  sequence: number;
  editPath: string;
  residencyRecorded: boolean;
  diffPayloadBytes: number;
  turnLabel: string;
}

/**
 * Linked list node for audit trail entries.
 */
export interface GlassHeapAuditNode {
  entry: GlassHeapAuditEntry;
  prev?: GlassHeapAuditNode;
  next?: GlassHeapAuditNode;
}

/**
 * Expectations for git diff --stat after both follow-up passes.
 */
export interface GlassHeapStatExpectation {
  expectedStatPath: string;
  minInsertions: number;
  maxDeletions: number;
}

/**
 * Timing marks for the follow-up write + append sequence.
 */
export interface GlassHeapFollowUpTiming {
  writeRequestedAtMs: number;
  writeAppliedAtMs: number;
  appendRequestedAtMs: number;
  appendAppliedAtMs: number;
  statCapturedAtMs: number;
}

/**
 * Line accounting after the first Write expansion.
 */
export interface GlassHeapFirstPassAccounting {
  targetLines: 400;
  actualLines: number;
  withinTolerance: boolean;
}

/**
 * Tolerance band for the first ~400 line expansion.
 */
export interface GlassHeapFirstPassTolerance {
  target: number;
  min: number;
  max: number;
}

export const GLASS_HEAP_FIRST_PASS_TOLERANCE: GlassHeapFirstPassTolerance = {
  target: 400,
  min: 360,
  max: 440,
};

/**
 * Inventory of interfaces required after the first Write.
 */
export interface GlassHeapFirstPassInventory {
  names: string[];
  marker: GlassHeapFollowUpMarker;
}

/**
 * Serialization shape for persisting follow-up multi-pass state.
 */
export interface GlassHeapPersistedFollowUpState {
  version: 2;
  multiPass: GlassHeapMultiPassState;
  timing?: GlassHeapFollowUpTiming;
  firstAccounting?: GlassHeapFirstPassAccounting;
}

/**
 * Validation error raised when follow-up expectations fail.
 */
export interface GlassHeapFollowUpValidationError {
  code:
    | "line_count_low"
    | "line_count_high"
    | "missing_interface"
    | "stat_path_missing";
  message: string;
  details: Record<string, string | number | boolean>;
}

/**
 * Validation report aggregating follow-up errors.
 */
export interface GlassHeapFollowUpValidationReport {
  ok: boolean;
  errors: GlassHeapFollowUpValidationError[];
}

/**
 * End-of-file marker for the first Write expansion (~400 lines).
 * The second edit appends additional interfaces below this region.
 */
export interface GlassHeapFirstPassTrailer {
  firstPassComplete: true;
  targetLines: 400;
  tool: "Write";
}

// ---------------------------------------------------------------------------
// Second follow-up append (~150 lines) via StrReplace / apply path.
// ---------------------------------------------------------------------------

/**
 * Follow-up block A: counters specific to conversation-local residency.
 */
export interface GlassHeapFollowUpBlockA {
  conversationApplies: number;
  writePasses: number;
  strReplacePasses: number;
  confirmedWithWc: boolean;
  confirmedWithDiffStat: boolean;
}

/**
 * Nested breakdown under follow-up block A.
 */
export interface GlassHeapFollowUpBlockADetails {
  parent: GlassHeapFollowUpBlockA;
  /** Workspace-relative path exercised by this turn. */
  relativePath: string;
  /** True when edits avoided writing only under /tmp. */
  workspacePathOnly: true;
}

/**
 * Follow-up block B: append accounting for the ~150 line second edit.
 */
export interface GlassHeapFollowUpBlockB {
  targetAdditionalLines: 150;
  minAdditionalLines: 130;
  maxAdditionalLines: 180;
  tool: "StrReplace";
}

/**
 * Line accounting after the second StrReplace append.
 */
export interface GlassHeapSecondPassAccounting {
  linesBeforeAppend: number;
  linesAfterAppend: number;
  delta: number;
  withinTolerance: boolean;
}

/**
 * Composite bundling follow-up blocks for assertions.
 */
export interface GlassHeapFollowUpComposite {
  a: GlassHeapFollowUpBlockA;
  b: GlassHeapFollowUpBlockB;
  secondPassComplete: boolean;
}

/**
 * Request object for capturing git diff --stat after append.
 */
export interface GlassHeapFollowUpStatRequest {
  cwd: string;
  relativePath: string;
  probeId: string;
}

/**
 * Response object from a git diff --stat capture.
 */
export interface GlassHeapFollowUpStatResponse {
  request: GlassHeapFollowUpStatRequest;
  envelope: GlassHeapGitStatEnvelope;
  pathMatched: boolean;
}

/**
 * Optional hooks around the second follow-up pass.
 */
export interface GlassHeapFollowUpHooks {
  beforeAppend?: (state: GlassHeapMultiPassState) => void;
  afterAppend?: (state: GlassHeapMultiPassState) => void;
  afterStat?: (response: GlassHeapFollowUpStatResponse) => void;
}

/**
 * Thin audit slice copied into telemetry payloads for the append.
 */
export interface GlassHeapFollowUpAuditSlice {
  sequence: number;
  editPath: "StrReplace";
  deltaLines: number;
  turnLabel: string;
}

/**
 * Inventory of interfaces introduced by the second append.
 */
export interface GlassHeapSecondPassInventory {
  names: Array<
    | "GlassHeapFollowUpBlockA"
    | "GlassHeapFollowUpBlockB"
    | "GlassHeapFollowUpComposite"
    | "GlassHeapSecondPassAccounting"
    | "GlassHeapFollowUpStatRequest"
    | "GlassHeapFollowUpStatResponse"
    | "GlassHeapFollowUpTrailer"
  >;
}

/**
 * Default tolerance for the second append (~150 lines).
 */
export interface GlassHeapSecondPassTolerance {
  targetDelta: number;
  minDelta: number;
  maxDelta: number;
}

export const GLASS_HEAP_SECOND_PASS_TOLERANCE: GlassHeapSecondPassTolerance = {
  targetDelta: 150,
  minDelta: 130,
  maxDelta: 180,
};

/**
 * End-of-file marker for the second StrReplace append pass.
 */
export interface GlassHeapFollowUpTrailer {
  secondPassComplete: true;
  targetAdditionalLines: 150;
  tool: "StrReplace";
  pairedWith: "GlassHeapFirstPassTrailer";
}
