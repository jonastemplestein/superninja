// Template clips back to text, for transcripts and audits (docs/SPEECH_TEMPLATES.md §5.4). A template clip plays from
// /a/t/<template>/<piece>-<key>.mp3 and is logged as t:<template>/<piece>-<key>; its words are rebuilt here from the
// template's text and the key's values, exactly as the generator recorded them.
//
// scripts/treadmill/transcript.ts can use it as it stands, before its line decode:
//   const t = decodeForTranscript(url); if (t) return t;   // { kind: "say", who: "sensei", text: "Say mat slowly." }
import { TEMPLATES, isTemplateId, pieceText, speechPieces, valuesFromKey, type TemplateId, type Values } from "./templates";

export interface DecodedTemplateClip {
  tpl: TemplateId;
  piece: number;
  key: string;
  /** the piece's own values ({ word: "mat" }); a template's clip slots are separate clips */
  values: Values;
  /** the words recorded: "Say mat slowly.", "Say the sound...", "...in rain." */
  text: string;
  who: "sensei";
  /** a lead-in (a pure sound or a demonstration follows) or a continuation (it follows one) */
  lead: boolean;
  cont: boolean;
}

const ID = /^t:([a-z][a-z0-9_]*)\/(\d+)-([a-z0-9_.]+)$/;
const URL_ = /\/a\/t\/([a-z][a-z0-9_]*)\/(\d+)-([a-z0-9_.]+)\.mp3(?:[?#].*)?$/;

/** Is this a template clip's URL (/a/t/…) or id (t:…)? True even for a template this build doesn't know. */
export const isTemplateClip = (s: string) => ID.test(s) || URL_.test(s);

/** A template clip's id or URL → its template, piece, values and text; null if it isn't a template clip, or names a
 *  template or piece this build doesn't have (see `describeTemplateClip` for a readable stand-in). */
export function decodeTemplateClip(idOrUrl: string): DecodedTemplateClip | null {
  const m = idOrUrl.match(ID) ?? idOrUrl.match(URL_);
  if (!m || !isTemplateId(m[1])) return null;
  const t = TEMPLATES[m[1]];
  const n = Number(m[2]);
  const p = speechPieces(t).find((x) => x.n === n);
  if (!p) return null;
  const values = valuesFromKey(t, p, m[3]);
  if (!values) return null;
  return { tpl: m[1], piece: n, key: m[3], values, text: pieceText(t, p, values), who: t.who, lead: p.lead, cont: p.cont };
}

/** The text a transcript shows for a template clip: its words, or "[t:<id>]" for one this build can't decode (a
 *  template from a newer build, a stale piece). */
export function describeTemplateClip(idOrUrl: string): string | null {
  const d = decodeTemplateClip(idOrUrl);
  if (d) return d.text;
  const m = idOrUrl.match(ID) ?? idOrUrl.match(URL_);
  return m ? `[t:${m[1]}/${m[2]}-${m[3]}]` : null;
}

/** transcript.ts's event shape for a spoken clip, or null when the URL isn't a template clip. */
export function decodeForTranscript(url: string): { kind: "say"; who: "sensei"; text: string; tpl: string } | null {
  const text = describeTemplateClip(url);
  if (text == null) return null;
  const m = (url.match(ID) ?? url.match(URL_))!;
  return { kind: "say", who: "sensei", text, tpl: m[1] };
}
