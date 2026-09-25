// The Sound Flower — a glow-up of the school's laminated "Extended Code alternative spellings" sheet.
// Spread 1: the sheet's two A4 pages of teardrop petals (same order, colours and spellings).
// Spread 2: the sounds the sheet leaves out, and the Flower itself, where completed petals are placed.
// Every spelling inside a petal is a gem: dim until taught, charging with practice, glowing when its Gem Trial
// is ready, and a solid jewel once won. Tap a petal to open it.
import { useEffect, useMemo, useState } from "react";
import { PETALS, CHART_PETALS, chartOf, neededGems, type Petal, type Gem } from "../content/flower";
import { PHONEMES, WORDS, type PhonemeId } from "../content/phonics";
import { say, sfx, playMusic } from "../engine/audio";
import { useSave, store, type Save } from "../engine/store";
import { gemState, energyOf, petalComplete, flowerComplete, knownNow, type GemState } from "../engine/gems";
import { img, RoundButton, Icon, fx, SenseiDock, tapProps, useHelp } from "../ui/ui";
import { GemIcon } from "../ui/Gem";
import { FlowerIntro } from "./Intros";

/** Teardrop petal (round top, point at the bottom), centred on 0,0 — the shape on the school's sheet. */
export const teardrop = (w: number, h: number) => {
  const r = w / 2;
  const cy = -h / 2 + r;
  return `M0,${h / 2} C${-w * 0.12},${h * 0.28} ${-r},${h * 0.06} ${-r},${cy} A${r},${r} 0 0 1 ${r},${cy} C${r},${h * 0.06} ${w * 0.12},${h * 0.28} 0,${h / 2} Z`;
};

const petalOf = (p: PhonemeId) => PETALS.find((x) => x.p === p)!;

/** One line of spelling inside a petal, styled by its gem state. */
function GemLine({ gem, st, energy, colour, size }: { gem: Gem; st: GemState; energy: number; colour: string; size: number }) {
  const base: React.CSSProperties = { fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: size, lineHeight: 1.08, padding: "0 5px", borderRadius: 6, position: "relative", whiteSpace: "nowrap" };
  if (st === "won") return <span className="gem-won" style={{ ...base, background: colour, color: "#fff", textShadow: "0 1px 0 #2b1d14", boxShadow: `0 0 0 2px #2b1d14, 0 0 10px ${colour}` }}>{gem.g}</span>;
  if (st === "ready") return <span className="gem-ready" style={{ ...base, background: "#ffc53d", color: "#2b1d14", boxShadow: "0 0 0 2px #2b1d14, 0 0 12px #ffc53d" }}>{gem.g}</span>;
  if (st === "charging")
    return (
      <span style={{ ...base, color: "#2b1d14" }}>
        {gem.g}
        <i style={{ position: "absolute", left: 4, right: 4, bottom: -1, height: 3, borderRadius: 2, background: "rgba(43,29,20,.12)" }}>
          <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${energy * 100}%`, borderRadius: 2, background: colour }} />
        </i>
      </span>
    );
  return <span style={{ ...base, color: st === "hidden" ? "rgba(43,29,20,.32)" : "rgba(43,29,20,.18)", fontStyle: "italic" }}>{gem.g}</span>;
}

function SheetPetal({ p, w, h, save, known, onOpen }: { p: PhonemeId; w: number; h: number; save: Save; known: Set<string>; onOpen: (p: Petal) => void }) {
  const pt = petalOf(p);
  const c = chartOf(p);
  const done = petalComplete(pt, save);
  const n = pt.gems.length;
  // fit the stacked spellings into the round part of the teardrop, like the sheet
  const size = Math.min(22, Math.floor((h * 0.66) / (n * 1.12)));
  return (
    <div
      role="button"
      aria-label={`petal ${p}`}
      {...tapProps(() => {
        sfx.petal();
        onOpen(pt);
        say({ sound: p });
      })}
      style={{ position: "relative", width: w, height: h, cursor: "pointer" }}
    >
      <svg viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`} width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id={`pf${p}`} cx="50%" cy="30%" r="75%">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor={c.colour} stopOpacity=".28" />
          </radialGradient>
        </defs>
        <path d={teardrop(w - 8, h - 6)} fill={done ? `url(#pf${p})` : "#fff"} stroke={c.colour} strokeWidth={done ? 6 : 4.5} style={done ? { filter: `drop-shadow(0 0 5px ${c.colour})` } : undefined} />
      </svg>
      <img src={img(`petal_${p}`)} alt="" style={{ position: "absolute", right: -10, top: -8, width: 34, height: 34, objectFit: "contain", filter: "drop-shadow(0 2px 2px rgba(0,0,0,.25))" }} onError={(e) => (e.currentTarget.style.display = "none")} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 10, height: h * 0.7, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: n > 8 ? 0 : 2, pointerEvents: "none" }}>
        {pt.gems.map((g) => (
          <GemLine key={g.key + g.g} gem={g} st={gemState(g, save, known)} energy={energyOf(g.key, save)} colour={c.colour} size={size} />
        ))}
      </div>
      {done && <span className="gem-sparkle" style={{ right: "30%", top: "8%", width: "30%", height: "22%" }} />}
    </div>
  );
}

/** The Flower: completed petals are placed around a golden centre. */
function Flower({ save, size }: { save: Save; size: number }) {
  const cx = size / 2;
  const rings = [CHART_PETALS.filter((c) => PHONEMES[c.p].vowel), CHART_PETALS.filter((c) => !PHONEMES[c.p].vowel)];
  const placed = PETALS.filter((pt) => petalComplete(pt, save)).length;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {rings.map((ring, ri) =>
        ring.map((c, i) => {
          const a = (i / ring.length) * 360 + (ri ? 7 : 0);
          const done = petalComplete(petalOf(c.p), save);
          const len = ri ? size * 0.2 : size * 0.18;
          const r0 = ri ? size * 0.3 : size * 0.13;
          return (
            <g key={c.p} transform={`translate(${cx} ${cx}) rotate(${a}) translate(0 ${-(r0 + len / 2)}) rotate(180)`}>
              <path d={teardrop(len * 0.46, len)} fill={done ? c.colour : "rgba(255,255,255,.5)"} stroke={done ? "#2b1d14" : "rgba(43,29,20,.25)"} strokeWidth={done ? 3 : 2} strokeDasharray={done ? undefined : "4 4"} />
            </g>
          );
        }),
      )}
      <circle cx={cx} cy={cx} r={size * 0.12} fill="#ffc53d" stroke="#2b1d14" strokeWidth={5} />
      <text x={cx} y={cx + 6} textAnchor="middle" fontFamily="Luckiest Guy, sans-serif" fontSize={size * 0.08} fill="#fff" stroke="#2b1d14" strokeWidth={4} paintOrder="stroke">{placed}</text>
      <text x={cx} y={cx + size * 0.065} textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight={800} fontSize={size * 0.032} fill="#2b1d14">of {PETALS.length}</text>
    </svg>
  );
}

export function Tree({ onBack, onTrial, celebrate }: { onBack: () => void; onTrial: (key: string) => void; celebrate?: { gem: string; won: boolean } }) {
  const save = useSave((s) => s);
  const known = useMemo(() => knownNow(save), [save]);
  const [spread, setSpread] = useState(0);
  const [intro, setIntro] = useState(() => !store.get().seenFlower && !celebrate);
  const [open, setOpen] = useState<Petal | null>(() => (celebrate ? PETALS.find((p) => p.gems.some((g) => g.key === celebrate.gem)) ?? null : null));
  useHelp(() => say({ line: "help_flower" }));

  useEffect(() => {
    playMusic("world_blossom");
    if (celebrate?.won) {
      (async () => {
        sfx.fanfare();
        fx.rain("petals", 50);
        await say({ line: "trial_win" });
        const pt = PETALS.find((p) => p.gems.some((g) => g.key === celebrate.gem));
        if (pt && petalComplete(pt)) {
          sfx.gong();
          fx.rain("confetti", 90);
          await say({ line: "petal_complete" });
        }
        if (flowerComplete()) await say({ line: "flower_complete" });
      })();
    } else if (store.get().seenFlower) say({ line: "flower_tap" });
  }, []);

  const page = (n: 1 | 2 | 3) => CHART_PETALS.filter((c) => c.page === n);
  const Grid = ({ n }: { n: 1 | 2 | 3 }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px 8px", justifyItems: "center", alignContent: "center", height: "100%", padding: "10px 10px" }}>
      {page(n).map((c) => (
        <SheetPetal key={c.p} p={c.p} w={104} h={156} save={save} known={known} onOpen={setOpen} />
      ))}
    </div>
  );

  return (
    <div className="scene" style={{ background: "#f7ddd0" }}>
      {/* laminated sheet: two A4 pages side by side */}
      <div style={{ position: "absolute", left: 150, right: 104, top: 20, bottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {(spread === 0 ? ([1, 2] as const) : ([3, 0] as const)).map((n, i) => (
          <div key={`${spread}-${i}`} className="sheet pop-in" style={{ animationDelay: `${i * 0.06}s` }}>
            {n === 0 ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div className="display" style={{ fontSize: 34, color: "#ff7aa2" }}>The Sound Flower</div>
                <Flower save={save} size={500} />
              </div>
            ) : (
              <Grid n={n} />
            )}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 10, top: "50%", translate: "0 -50%" }}>
        <RoundButton label={spread === 0 ? "next page" : "previous page"} className="pink" onClick={() => { sfx.page(); setSpread(spread ? 0 : 1); }}>
          {spread === 0 ? <Icon.next /> : <Icon.back />}
        </RoundButton>
      </div>

      {intro && (
        <FlowerIntro
          onDone={() => {
            store.set((s) => void (s.seenFlower = true));
            setIntro(false);
            say({ line: "flower_tap" });
          }}
        />
      )}
      {open && <PetalDetail pt={open} onClose={() => setOpen(null)} onTrial={onTrial} celebrateGem={celebrate?.won ? celebrate.gem : undefined} />}

      <div className="topbar">
        <RoundButton sm label="back" onClick={onBack}><Icon.home /></RoundButton>
      </div>
      <SenseiDock hidden />
    </div>
  );
}

function PetalDetail({ pt, onClose, onTrial, celebrateGem }: { pt: Petal; onClose: () => void; onTrial: (key: string) => void; celebrateGem?: string }) {
  const save = useSave((s) => s);
  const known = knownNow(save);
  const c = chartOf(pt.p);
  const example = WORDS.find((w) => w.pic && w.segs.some((s) => s.p === pt.p));
  const tapGem = (key: string) => {
    const gem = pt.gems.find((g) => g.key === key)!;
    const st = gemState(gem, save, known);
    if (st === "ready") {
      sfx.great();
      onTrial(key);
    } else if (st === "won") say({ sound: pt.p });
    else if (st === "charging") say([{ sound: pt.p }, { gap: 200 }, { line: "gem_charging" }]);
    else if (st === "hidden") say({ line: "gem_hidden" });
    else say({ line: "gem_future" });
  };
  const n = pt.gems.length;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(29,18,48,.55)" }} {...tapProps(onClose)}>
      <div className="sheet pop-in" onPointerDown={(e) => e.stopPropagation()} style={{ position: "absolute", left: 150, right: 60, top: 40, bottom: 30, padding: 24, display: "flex", gap: 20 }}>
        <div style={{ width: 250, flex: "none", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div {...tapProps(() => say({ sound: pt.p }))} style={{ position: "relative", cursor: "pointer" }}>
            <svg viewBox="-110 -160 220 320" width="200" height="290" style={{ overflow: "visible" }}>
              <path d={teardrop(200, 300)} fill="#fff" stroke={c.colour} strokeWidth={9} />
              <text x="0" y="-40" textAnchor="middle" fontFamily="Andika, sans-serif" fontWeight={700} fontSize={PHONEMES[pt.p].label.length > 2 ? 60 : 78} fill={c.colour} style={{ paintOrder: "stroke", stroke: "#2b1d14", strokeWidth: 3 }}>
                {PHONEMES[pt.p].label}
              </text>
            </svg>
            <img src={img(`petal_${pt.p}`)} alt="" style={{ position: "absolute", left: 50, top: 120, width: 100, height: 100, objectFit: "contain" }} onError={(e) => (e.currentTarget.style.display = "none")} />
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <RoundButton label="Hear the sound" onClick={() => say({ sound: pt.p })}><Icon.speaker /></RoundButton>
            {example && <img src={img(`pic_${example.text}`)} alt="" style={{ width: 84, height: 84, objectFit: "contain", cursor: "pointer" }} {...tapProps(() => say({ word: example.text }))} />}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexWrap: "wrap", alignContent: "center", justifyContent: "center", gap: 6, marginRight: 60 }}>
          {pt.gems.map((g) => {
            const st = gemState(g, save, known);
            return (
              <div key={g.key + g.g} role="button" aria-label={`gem ${g.g} ${st}`} {...tapProps(() => tapGem(g.key))} className={g.key === celebrateGem ? "pop-in" : ""} style={{ textAlign: "center", cursor: "pointer" }}>
                <GemIcon g={g.g} colour={c.colour} state={st} energy={energyOf(g.key, save)} size={n > 8 ? 110 : n > 5 ? 130 : n > 3 ? 150 : 180} />
                {st === "ready" && (
                  <div className="btn-round go pulse" style={{ width: 78, height: 78, margin: "-6px auto 0" }}>
                    <Icon.play />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", right: 16, top: 16 }}>
          <RoundButton sm label="close" onClick={onClose}><Icon.check /></RoundButton>
        </div>
      </div>
    </div>
  );
}

export { neededGems };
