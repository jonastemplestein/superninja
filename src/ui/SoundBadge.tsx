// A sound, shown to a child as its petal (docs/NAVIGATION.md §4): the teardrop in its school-chart colour with the
// chart picture in the round part, never letters. Spellings (gems, tiles, chests) still show letters; that is the point.
// A tap says the pure sound; the badge swells whenever its sound clip plays, so the picture and the sound arrive together.
import { useEffect, useState, type CSSProperties } from "react";
import { PHONEMES, type PhonemeId } from "../content/phonics";
import { onClip, say } from "../engine/audio";
import { Icon, tapProps } from "./ui";
import { mix, petalColour, petalImg, teardropAt } from "./petal";

/** Height of a badge `size` wide (the chart's teardrop: 96 × 132). */
export const badgeHeight = (size: number) => Math.round(size * 1.375);

/**
 * `<SoundBadge p="s" />`: the sound's petal, `size` px wide (stage px; height `badgeHeight(size)`).
 * - A tap says the pure sound (`say({ sound: p })`); `onTap` replaces that (e.g. not while a spell is on its way).
 * - `pulse`: it bounces for attention. `still`: a picture only (no button, no speaker), e.g. inside a caption.
 * - `speaker`: the small speaker in the point (default: from 64 px up).
 * - `aria-label` "Hear the sound", `data-nav="sound"`, `data-p`; grown-ups get /ae/ as a tooltip, children see no letters.
 */
export function SoundBadge({ p, size = 96, onTap, pulse, still, speaker, className = "", style, label = "Hear the sound" }: {
  p: PhonemeId;
  size?: number;
  onTap?: () => void;
  pulse?: boolean;
  still?: boolean;
  speaker?: boolean;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  const [swell, setSwell] = useState(0);
  useEffect(() => onClip((id) => void (id === `sound:${p}` && setSwell((k) => k + 1))), [p]);
  const w = size, h = badgeHeight(size);
  const ink = Math.max(5, (15 * size) / 200); // the chart look (Tree.tsx .pd-petal): a chart-colour line over an ink line
  const line = Math.max(3, (9 * size) / 200);
  const tw = w - ink, th = h - ink;
  const d = teardropAt(tw, th, w / 2, h / 2);
  const cy = h / 2 - th / 2 + tw / 2; // the centre of the round part
  const pic = w * 0.6;
  const colour = petalColour(p);
  const withSpeaker = !still && (speaker ?? size >= 64);
  const sp = w * 0.28;
  const inner = (
    <span key={swell} className={`sound-badge-in ${swell ? "swell" : ""}`}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
        <path d={d} fill="#fff" stroke="#2b1d14" strokeWidth={ink} strokeLinejoin="round" />
        <path d={d} fill={mix(colour, "#ffffff", 0.82)} stroke={colour} strokeWidth={line} strokeLinejoin="round" />
      </svg>
      <img src={petalImg(p)} alt="" draggable={false} style={{ left: (w - pic) / 2, top: cy - pic / 2, width: pic, height: pic }} onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
      {withSpeaker && (
        <span className="sound-badge-hear" style={{ left: (w - sp) / 2, top: h * 0.72 - sp / 2, width: sp, height: sp, borderWidth: Math.max(3, sp * 0.08) }}>
          <Icon.speaker />
        </span>
      )}
    </span>
  );
  const title = `/${PHONEMES[p]?.label ?? p}/`;
  if (still)
    return (
      <span className={`sound-badge still ${className}`} data-p={p} title={title} aria-hidden="true" style={{ width: w, height: h, ...style }}>
        {inner}
      </span>
    );
  return (
    <button
      className={`sound-badge ${pulse ? "pulse" : ""} ${className}`}
      aria-label={label}
      data-nav="sound"
      data-p={p}
      title={title}
      style={{ width: w, height: h, ...style }}
      {...tapProps(() => (onTap ? onTap() : void say({ sound: p })))}
    >
      {inner}
    </button>
  );
}
