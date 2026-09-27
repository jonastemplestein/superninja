// Shared shape for everything the playtest treadmill reports (bots, invariant checks, visual critic, personas).
export type Severity = "blocker" | "major" | "minor" | "polish";
export type Source = "bot" | "invariant" | "critic" | "persona" | "jev" | "script" | "sound";
export interface Finding {
  /** stable signature for de-duplication across runs: source + case + kind (+ selector) */
  sig: string;
  source: Source;
  severity: Severity;
  /** level id (w1-4) or scene name (training, placement, map, persona:<name>) */
  case: string;
  title: string;
  detail: string;
  /** files under the run directory: screenshots, filmstrips, logs */
  evidence: string[];
  repro?: string;
}
/** Per-case metadata written next to each filmstrip, for the visual critic. */
export interface CaseMeta {
  case: string;
  url: string;
  kind: string;
  title: string;
  /** one-line description of what the child is supposed to do in this activity */
  intent: string;
  frames: { file: string; t: number; snState: unknown; caption: string; settling?: boolean }[];
}
