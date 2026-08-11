// Glass heap AppliedDiffs residency probe target.
// Seed content — expand via edit/apply path.
// This file is intentionally large and interface-heavy so Cursor's
// AppliedDiffs residency probe can track multi-hunk edit/apply diffs
// against a real workspace path (not only /tmp).

/**
 * Stable identifier for a single residency probe run.
 * Used to correlate apply events across agent turns.
 */
export interface GlassHeapSeed {
  /** Probe marker for residency tracking. */
  probeId: string;
}

/**
 * Lifecycle phase of an AppliedDiffs residency session.
 * Values are ordered from cold start through garbage collection.
 */
export type GlassHeapPhase =
  | "cold"
  | "warm"
  | "resident"
  | "evicted"
  | "rehydrated";

/**
 * Severity band for heap-pressure signals observed during apply.
 */
export type GlassHeapPressureBand = "low" | "moderate" | "high" | "critical";

/**
 * Opaque handle returned by the residency tracker when a file
 * enters the tracked set. Not a filesystem path.
 */
export interface GlassHeapHandle {
  /** Monotonic handle id assigned by the tracker. */
  handleId: number;
  /** Workspace-relative path that was registered. */
  relativePath: string;
  /** Phase at the moment the handle was minted. */
  phase: GlassHeapPhase;
}

/**
 * Snapshot of heap residency for one tracked TypeScript module.
 */
export interface GlassHeapModuleSnapshot {
  handle: GlassHeapHandle;
  /** Approximate resident byte size of the tracked buffer. */
  residentBytes: number;
  /** Number of apply operations observed for this module. */
  applyCount: number;
  /** Last apply wall-clock timestamp in milliseconds since epoch. */
  lastApplyAtMs: number;
  pressure: GlassHeapPressureBand;
}

/**
 * Diff hunk metadata captured after a successful apply.
 * Kept deliberately verbose for probe surface area.
 */
export interface GlassHeapHunkMeta {
  /** 1-based start line in the post-apply document. */
  startLine: number;
  /** 1-based end line in the post-apply document (inclusive). */
  endLine: number;
  /** Lines added by this hunk. */
  addedLines: number;
  /** Lines removed by this hunk. */
  removedLines: number;
  /** Whether the hunk touched only comments/interfaces. */
  interfacesOrCommentsOnly: boolean;
}

/**
 * Aggregate apply result for a single edit/apply invocation.
 */
export interface GlassHeapApplyResult {
  handle: GlassHeapHandle;
  /** True when the apply path recorded the diff in the residency map. */
  tracked: boolean;
  hunks: GlassHeapHunkMeta[];
  /** Total lines in the file after apply. */
  postApplyLineCount: number;
  phase: GlassHeapPhase;
}

/**
 * Configuration knobs for the residency probe harness.
 * Defaults should keep the probe deterministic across CI agents.
 */
export interface GlassHeapProbeConfig {
  /** Target line count for the first expansion edit. */
  firstExpansionLines: number;
  /** Target line count for the second append edit. */
  secondAppendLines: number;
  /** Maximum age of a resident entry before soft eviction. */
  softEvictionTtlMs: number;
  /** Whether to record interface-only hunks as first-class events. */
  trackInterfaceHunks: boolean;
  /** Optional label appended to probe telemetry. */
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
    | "stat";
  atMs: number;
  payload: Record<string, string | number | boolean>;
}

/**
 * Pressure sample taken from the agent process during apply.
 */
export interface GlassHeapPressureSample {
  atMs: number;
  /** Heap used bytes from the runtime. */
  heapUsedBytes: number;
  /** Heap total bytes from the runtime. */
  heapTotalBytes: number;
  /** External bytes attributed to native bindings, if available. */
  externalBytes: number;
  band: GlassHeapPressureBand;
}

/**
 * Mapping from workspace path to the latest module snapshot.
 */
export interface GlassHeapResidencyMap {
  /** Probe id owning this map. */
  probeId: string;
  /** Path-keyed snapshots; keys are workspace-relative. */
  modules: Record<string, GlassHeapModuleSnapshot>;
  /** Chronological telemetry ring buffer. */
  events: GlassHeapTelemetryEvent[];
}

/**
 * Options for registering a new file into the residency map.
 */
export interface GlassHeapRegisterOptions {
  relativePath: string;
  initialPhase?: GlassHeapPhase;
  /** When true, skip if the path is already registered. */
  idempotent?: boolean;
}

/**
 * Options controlling a simulated apply against a registered module.
 */
export interface GlassHeapSimulateApplyOptions {
  handle: GlassHeapHandle;
  hunks: GlassHeapHunkMeta[];
  postApplyLineCount: number;
  /** Force a pressure band for deterministic tests. */
  forcePressure?: GlassHeapPressureBand;
}

/**
 * Result of a residency eviction pass.
 */
export interface GlassHeapEvictionReport {
  scanned: number;
  evicted: number;
  retained: number;
  /** Handles that were soft-evicted but remain recoverable. */
  recoverableHandles: number[];
}

/**
 * Descriptor for a second-pass append used by this probe.
 */
export interface GlassHeapAppendPass {
  /** Human-readable pass name for logs. */
  passName: string;
  /** Expected approximate line delta. */
  expectedDeltaLines: number;
  /** Interfaces introduced in this pass. */
  interfaceNames: string[];
}

/**
 * Bookkeeping for multi-pass probe runs (first expand, then append).
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
  /** True when the path appears in the working tree diff. */
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
  /** Serialized snapshot blob; opaque to callers. */
  blob: string;
  evictedAtMs: number;
}

/**
 * Rehydration request for a previously evicted soft entry.
 */
export interface GlassHeapRehydrateRequest {
  handleId: number;
  /** When true, fail if the blob checksum mismatches. */
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
  /** Simple length-based fingerprint for the probe. */
  lineCount: number;
  /** Hash of interface names present in the file. */
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
 * Assertion expectation for the first expansion (~300 lines).
 */
export interface GlassHeapFirstExpansionExpectation {
  minLineCount: number;
  maxLineCount: number;
  mustIncludeInterfaces: string[];
}

/**
 * Assertion expectation for the second append (~200 lines).
 */
export interface GlassHeapSecondAppendExpectation {
  minAdditionalLines: number;
  mustIncludeInterfaces: string[];
}

/**
 * Combined expectations for the full residency probe scenario.
 */
export interface GlassHeapScenarioExpectations {
  first: GlassHeapFirstExpansionExpectation;
  second: GlassHeapSecondAppendExpectation;
  /** Workspace path that must appear in git diff --stat. */
  diffStatPath: string;
}

/**
 * Default scenario expectations for this fixture file.
 * Tuned for ~300 then +~200 line edits via apply.
 */
export const GLASS_HEAP_SCENARIO_EXPECTATIONS: GlassHeapScenarioExpectations = {
  first: {
    minLineCount: 280,
    maxLineCount: 340,
    mustIncludeInterfaces: [
      "GlassHeapSeed",
      "GlassHeapHandle",
      "GlassHeapModuleSnapshot",
      "GlassHeapApplyResult",
      "GlassHeapProbeConfig",
      "GlassHeapResidencyMap",
      "GlassHeapDiagnosticDump",
      "GlassHeapScenarioExpectations",
    ],
  },
  second: {
    minAdditionalLines: 180,
    mustIncludeInterfaces: [
      "GlassHeapAppendBlockA",
      "GlassHeapAppendBlockB",
      "GlassHeapAppendBlockC",
    ],
  },
  diffStatPath: "tmp/glass-heap-apply-target.ts",
};

/**
 * Default probe configuration matching the scenario above.
 */
export const GLASS_HEAP_DEFAULT_CONFIG: GlassHeapProbeConfig = {
  firstExpansionLines: 300,
  secondAppendLines: 200,
  softEvictionTtlMs: 60_000,
  trackInterfaceHunks: true,
  telemetryLabel: "applied-diffs-residency",
};

/**
 * Marker constant so the module has a stable export for imports.
 */
export const GLASS_HEAP_PROBE_MARKER = "glass-heap-apply-target-v1" as const;

/**
 * Helper type: readonly view of the residency map modules collection.
 */
export type GlassHeapModulesReadonly = Readonly<
  Record<string, GlassHeapModuleSnapshot>
>;

/**
 * Helper type: union of all telemetry kind literals.
 */
export type GlassHeapTelemetryKind = GlassHeapTelemetryEvent["kind"];

/**
 * Narrow interface used by git-stat printers in the probe harness.
 */
export interface GlassHeapGitStatLine {
  /** Path as shown by git diff --stat. */
  path: string;
  /** Formatted pipe bar from git, optional. */
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
  /** Raw stdout retained for debugging. */
  rawStat: string;
}

/**
 * End-of-file marker interface for the first expansion pass.
 * The second edit appends additional interfaces below this region.
 */
export interface GlassHeapFirstPassTrailer {
  /** Always true for the first-pass trailer. */
  firstPassComplete: true;
  /** Approximate line target satisfied by the first edit. */
  targetLines: 300;
}

// ---------------------------------------------------------------------------
// Second substantial append (~200 lines) for AppliedDiffs residency probe.
// Everything below is intentionally additive so the second apply creates a
// large trailing hunk that Cursor can track independently of the first edit.
// ---------------------------------------------------------------------------

/**
 * Append block A: synthetic catalog of residency counters.
 * Used only by the probe; not wired into production paths.
 */
export interface GlassHeapAppendBlockA {
  /** Number of cold registrations observed. */
  coldRegistrations: number;
  /** Number of warm hits after the first apply. */
  warmHits: number;
  /** Number of resident hits while the buffer stayed pinned. */
  residentHits: number;
  /** Number of soft evictions performed by the harness. */
  softEvictions: number;
  /** Number of successful rehydrations after eviction. */
  rehydrations: number;
}

/**
 * Per-counter breakdown nested under append block A.
 */
export interface GlassHeapAppendBlockABreakdown {
  parent: GlassHeapAppendBlockA;
  /** Rolling window size in samples. */
  windowSize: number;
  /** Mean resident bytes across the window. */
  meanResidentBytes: number;
  /** Peak resident bytes across the window. */
  peakResidentBytes: number;
}

/**
 * Append block B: apply-path audit trail entries.
 */
export interface GlassHeapAppendBlockB {
  /** Monotonic sequence for audit ordering. */
  sequence: number;
  /** Tool path that produced the edit (e.g. apply_patch / StrReplace). */
  editPath: string;
  /** Whether the edit was recorded in the residency map. */
  residencyRecorded: boolean;
  /** Bytes of the unified diff payload, if available. */
  diffPayloadBytes: number;
}

/**
 * Linked list node for block B audit trails.
 */
export interface GlassHeapAppendBlockBNode {
  entry: GlassHeapAppendBlockB;
  prev?: GlassHeapAppendBlockBNode;
  next?: GlassHeapAppendBlockBNode;
}

/**
 * Append block C: expectations for git diff --stat after both passes.
 */
export interface GlassHeapAppendBlockC {
  /** Expected path fragment in diff --stat output. */
  expectedStatPath: string;
  /** Minimum insertions expected after both edits. */
  minInsertions: number;
  /** Maximum deletions expected (seed replacement should stay small). */
  maxDeletions: number;
}

/**
 * Composite view bundling append blocks A–C for assertions.
 */
export interface GlassHeapAppendComposite {
  a: GlassHeapAppendBlockA;
  b: GlassHeapAppendBlockB;
  c: GlassHeapAppendBlockC;
  /** True when the second append pass has finished. */
  secondPassComplete: boolean;
}

/**
 * Timing marks for the second append apply.
 */
export interface GlassHeapAppendTimingMarks {
  /** When the second edit was requested. */
  requestedAtMs: number;
  /** When the apply tool acknowledged the edit. */
  appliedAtMs: number;
  /** When git diff --stat was captured. */
  statCapturedAtMs: number;
}

/**
 * Detailed line accounting for the second append.
 */
export interface GlassHeapAppendLineAccounting {
  linesBeforeSecondPass: number;
  linesAfterSecondPass: number;
  /** linesAfter - linesBefore */
  delta: number;
  /** Whether delta is within the ~200 line tolerance band. */
  withinTolerance: boolean;
}

/**
 * Tolerance band used by append line accounting.
 */
export interface GlassHeapAppendToleranceBand {
  targetDelta: number;
  minDelta: number;
  maxDelta: number;
}

/**
 * Default tolerance for the second append (~200 lines).
 */
export const GLASS_HEAP_APPEND_TOLERANCE: GlassHeapAppendToleranceBand = {
  targetDelta: 200,
  minDelta: 160,
  maxDelta: 260,
};

/**
 * Named interface inventory introduced by the second pass.
 * Mirrors mustIncludeInterfaces in scenario expectations.
 */
export interface GlassHeapSecondPassInterfaceInventory {
  names: Array<
    | "GlassHeapAppendBlockA"
    | "GlassHeapAppendBlockB"
    | "GlassHeapAppendBlockC"
    | "GlassHeapAppendComposite"
    | "GlassHeapAppendTimingMarks"
    | "GlassHeapAppendLineAccounting"
    | "GlassHeapAppendToleranceBand"
    | "GlassHeapAppendAuditSlice"
    | "GlassHeapAppendStatRequest"
    | "GlassHeapAppendStatResponse"
    | "GlassHeapSecondPassTrailer"
  >;
}

/**
 * Thin audit slice copied into telemetry payloads.
 */
export interface GlassHeapAppendAuditSlice {
  sequence: number;
  editPath: string;
  deltaLines: number;
}

/**
 * Request object for capturing git diff --stat after append.
 */
export interface GlassHeapAppendStatRequest {
  /** cwd for the git invocation; workspace root. */
  cwd: string;
  /** Path relative to cwd. */
  relativePath: string;
  /** Optional probe id stamped into the response envelope. */
  probeId: string;
}

/**
 * Response object from a git diff --stat capture.
 */
export interface GlassHeapAppendStatResponse {
  request: GlassHeapAppendStatRequest;
  envelope: GlassHeapGitStatEnvelope;
  /** True when relativePath appeared in the stat output. */
  pathMatched: boolean;
}

/**
 * Optional hooks the harness may register around the second pass.
 */
export interface GlassHeapAppendHooks {
  /** Called immediately before the second StrReplace/apply. */
  beforeAppend?: (state: GlassHeapMultiPassState) => void;
  /** Called immediately after the second apply succeeds. */
  afterAppend?: (state: GlassHeapMultiPassState) => void;
  /** Called after git diff --stat is parsed. */
  afterStat?: (response: GlassHeapAppendStatResponse) => void;
}

/**
 * Serialization shape for persisting multi-pass state between turns.
 */
export interface GlassHeapAppendPersistedState {
  version: 1;
  multiPass: GlassHeapMultiPassState;
  composite?: GlassHeapAppendComposite;
  timing?: GlassHeapAppendTimingMarks;
  accounting?: GlassHeapAppendLineAccounting;
}

/**
 * Validation error raised when second-pass expectations fail.
 */
export interface GlassHeapAppendValidationError {
  code:
    | "delta_too_small"
    | "delta_too_large"
    | "missing_interface"
    | "stat_path_missing";
  message: string;
  details: Record<string, string | number | boolean>;
}

/**
 * Validation report aggregating zero or more append errors.
 */
export interface GlassHeapAppendValidationReport {
  ok: boolean;
  errors: GlassHeapAppendValidationError[];
}

/**
 * End-of-file marker for the second append pass.
 * Presence of this interface indicates both probe edits completed.
 */
export interface GlassHeapSecondPassTrailer {
  /** Always true for the second-pass trailer. */
  secondPassComplete: true;
  /** Approximate additional lines targeted by the second edit. */
  targetAdditionalLines: 200;
  /** Cross-check against the first-pass trailer. */
  pairedWith: "GlassHeapFirstPassTrailer";
}

