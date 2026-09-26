import type { SwUnitId } from "../../src/content/sw";

export interface UnitWord {
  text: string;
  segs: string;
  unit: SwUnitId;
  pic?: string;
  tags: string[];
}

export interface UnitSentence {
  text: string;
  maxUnit: SwUnitId;
  special?: string[];
}

export interface UnitData {
  words: UnitWord[];
  sentences: UnitSentence[];
  chains: string[][];
  /** Chain-only pronounceable pseudo-words, never counted as real words. */
  nonsense?: string[];
  poly: { text: string; syllables: string; schwa?: number[] }[];
}
