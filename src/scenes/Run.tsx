// Ninja Run: auto-running platformer. Tap/space to jump (double jump). Word events:
//  - "blend": Sensei says the sounds (c-a-t); lanterns carry written words; catch the one that blends to them.
//  - "read": a word appears on the banner; lanterns carry pictures; catch the matching picture.
// The world slows down while lanterns are on screen so there is time to read. No fail state.
import { useEffect, useRef, useState } from "react";
import type { LevelProps } from "../App";
import type { Word } from "../content/phonics";
import { levelWords, worldOf } from "../content/worlds";
import { say, sayBlend, sfx, playMusic, preload, urls, hush } from "../engine/audio";
import { chooseWords, shuffle } from "../engine/learner";
import { recordRead } from "../engine/store";
import { img, RoundButton, Icon, Progress, fx, useHero, W, H, sleep, useHelp } from "../ui/ui";
import { CaptionTop } from "./Battle";
import { pickPraise } from "./Dojo";

const GROUND = 612;
const GRAV = 3000;
const JUMP_V = -1280;
const EVENTS = 6;

type Lantern = { x: number; y: number; word: Word; correct: boolean; popped: boolean; phase: number };
type Thing = { x: number; kind: "crate" | "spikes" | "petal"; y: number; got?: boolean };

function similar(target: Word, pool: Word[], n: number): Word[] {
  const score = (w: Word) => {
    if (w.text === target.text) return -1;
    let s = 0;
    if (w.segs.length === target.segs.length) s += 3;
    for (let i = 0; i < Math.min(w.segs.length, target.segs.length); i++) if (w.segs[i].p === target.segs[i].p) s += 2;
    return s + Math.random();
  };
  return pool.filter((w) => w.text !== target.text).sort((a, b) => score(b) - score(a)).slice(0, n);
}

export function Run({ level, onDone, onQuit }: LevelProps) {
  const world = worldOf(level);
  const hero = useHero();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [banner, setBanner] = useState<{ text: string; mode: "read" | "blend" } | null>(null);
  const [petals, setPetals] = useState(0);
  const api = useRef<{ jump: () => void; tapAt: (x: number, y: number) => void; repeat: () => void }>({ jump: () => {}, tapAt: () => {}, repeat: () => {} });

  useEffect(() => {
    playMusic("run");
    const pool = levelWords(level);
    const targets = chooseWords(level, EVENTS, "read");
    preload(targets.map((w) => urls.word(w.text)));
    const c = canvasRef.current!;
    const g = c.getContext("2d")!;
    const im = (id: string) => {
      const i = new Image();
      i.src = img(id);
      return i;
    };
    const I = {
      bg: im(`run_${world.key}`), run: im(`hero_${hero}_run`), jump: im(`hero_${hero}_jump`), hurt: im(`hero_${hero}_hurt`), cheer: im(`hero_${hero}_cheer`),
      crate: im("item_crate"), spikes: im("item_spikes"), petal: im("item_petal"), lantern: im("item_lantern"), gong: im("item_gong"),
      pics: Object.fromEntries(pool.filter((w) => w.pic).map((w) => [w.text, im(`pic_${w.text}`)])) as Record<string, HTMLImageElement>,
    };

    // ---- state
    let alive = true;
    let t = 0;
    let dist = 0;
    let speed = 400;
    let targetSpeed = 400;
    const heroS = { x: 250, y: GROUND, vy: 0, jumps: 0, hurtT: 0, homing: null as Lantern | null };
    let things: Thing[] = [];
    let lanterns: Lantern[] = [];
    let eventIdx = 0;
    let firstTry = 0;
    let eventMisses = 0;
    let busy = false; // an event is running
    let nextEventAt = 900; // distance
    let gongX: number | null = null;
    let finished = false;
    let mode: "blend" | "read" = "blend";
    let current: Word | null = null;
    let collected = 0;

    // obstacles & petals ahead
    const spawnStuff = (fromX: number, toX: number) => {
      for (let x = fromX; x < toX; x += 420 + Math.random() * 380) {
        const r = Math.random();
        if (r < 0.35) things.push({ x, kind: Math.random() < 0.6 ? "crate" : "spikes", y: GROUND });
        else for (let k = 0; k < 4; k++) things.push({ x: x + k * 70, kind: "petal", y: GROUND - 120 - Math.sin((k / 3) * Math.PI) * 120 });
      }
    };
    spawnStuff(900, 1800);

    const startEvent = async () => {
      if (eventIdx >= EVENTS) {
        gongX = dist + W + 200;
        return;
      }
      busy = true;
      const w = targets[eventIdx];
      current = w;
      mode = eventIdx % 2 === 0 || !w.pic ? "blend" : "read";
      if (mode === "read") {
        const withPics = pool.filter((x) => x.pic);
        if (withPics.length < 3) mode = "blend";
      }
      const n = level.world === 1 ? 1 : 2; // beginners: two lanterns, not three moving choices
      const others = mode === "blend" ? similar(w, pool, n) : similar(w, pool.filter((x) => x.pic && x.text !== w.text), n);
      const opts = shuffle([w, ...others]);
      eventMisses = 0;
      // clear obstacles in the lantern zone
      const zoneStart = dist + W + 100;
      things = things.filter((th) => th.x < zoneStart - 200 || th.x > zoneStart + 1400);
      lanterns = opts.map((o, i) => ({ x: zoneStart + i * 420, y: 330 + (i % 2) * 30, word: o, correct: o === w, popped: false, phase: Math.random() * 6 }));
      if (mode === "blend") {
        setBanner({ text: "", mode });
        await say(eventIdx === 0 ? [{ line: "run_start" }, { gap: 300 }, { line: "run_blend" }] : [{ line: "run_blend" }]);
        await say({ sounds: w.segs, gap: 330 });
      } else {
        setBanner({ text: w.text, mode });
        await say([{ line: "run_read" }]);
      }
    };

    const catchLantern = async (l: Lantern) => {
      if (l.popped || !current) return;
      l.popped = true;
      const w = current;
      if (l.correct) {
        if (eventMisses === 0) firstTry++;
        recordRead(w, eventMisses === 0);
        sfx.great();
        fx.burst(l.x - dist, l.y, "petals", 26);
        fx.burst(l.x - dist, l.y, "stars", 12);
        lanterns.forEach((o) => (o.popped = true));
        setBanner(null);
        current = null;
        await sayBlend(w.segs, w.text);
        await say({ line: pickPraise() });
        eventIdx++;
        setProgress(eventIdx / EVENTS);
        busy = false;
        nextEventAt = dist + 900;
        spawnStuff(dist + W + 200, dist + W + 1400);
      } else {
        eventMisses++;
        recordRead(w, false);
        sfx.wrong();
        fx.burst(l.x - dist, l.y, "dust", 10);
        // specific: "That says c-o-t, cot. Listen: c-a-t."
        await say([{ line: "that_says" }, { sounds: l.word.segs, gap: 200 }, { word: l.word.text }, { gap: 250 }, { line: "listen" }, ...(mode === "blend" ? [{ sounds: w.segs, gap: 300 }] : [{ word: w.text }])], { reveal: true });
      }
    };

    (window as any).__snRun = () => {
      const l = lanterns.find((l) => l.correct && !l.popped && l.x - dist < W - 40);
      if (l) heroS.homing = l;
      return { busy, eventIdx, finished };
    };
    (window as any).__snState = { scene: "run" };
    (window as any).__snRunHelp = (n: number) => {
      if (!current) return say({ line: "help_run" });
      if (n === 1) return say(mode === "blend" ? [{ line: "run_blend" }, { sounds: current.segs, gap: 330 }] : [{ line: "run_read" }]);
      if (n === 2) return say({ line: "help_run" });
      // biggest clue: the ninja flies to the right lantern
      const l = lanterns.find((l) => l.correct && !l.popped && l.x - dist < W - 40);
      say({ line: "help_look" });
      if (l) heroS.homing = l;
    };
    api.current.repeat = () => {
      if (current) say(mode === "blend" ? { sounds: current.segs, gap: 330 } : { word: current.text });
    };
    api.current.jump = () => {
      if (finished) return;
      if (heroS.jumps < 2) {
        heroS.vy = JUMP_V * (heroS.jumps ? 0.85 : 1);
        heroS.jumps++;
        sfx.jump();
        if (heroS.jumps === 1) fx.burst(heroS.x, GROUND, "dust", 6);
      }
    };
    api.current.tapAt = (x, y) => {
      const hit = lanterns.find((l) => !l.popped && Math.hypot(l.x - dist - x, l.y + 30 - y) < 110);
      if (hit) {
        heroS.homing = hit;
        sfx.whoosh();
        return;
      }
      api.current.jump();
    };

    // ---- drawing helpers
    const drawTiled = (image: HTMLImageElement, offset: number, y: number, h: number) => {
      if (!image.complete || !image.naturalWidth) return;
      const w = (image.naturalWidth / image.naturalHeight) * h;
      let x = -(offset % (w * 2));
      while (x < W) {
        // mirror every other copy so edges match
        const k = Math.floor((x + offset) / w + 0.001);
        g.save();
        if (k % 2 === 1) {
          g.translate(x + w, y);
          g.scale(-1, 1);
          g.drawImage(image, 0, 0, w, h);
        } else g.drawImage(image, x, y, w, h);
        g.restore();
        x += w;
      }
    };
    const drawGround = (off: number) => {
      // earth
      const grd = g.createLinearGradient(0, GROUND, 0, H);
      grd.addColorStop(0, "#8b5a3c");
      grd.addColorStop(1, "#5a3624");
      g.fillStyle = grd;
      g.fillRect(0, GROUND + 10, W, H - GROUND);
      // grass lip with ink outline
      g.fillStyle = world.colour;
      g.strokeStyle = "#2b1d14";
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(-10, H);
      g.lineTo(-10, GROUND);
      for (let x = -10; x <= W + 40; x += 40) {
        const wx = x + (off % 40);
        g.quadraticCurveTo(x - (off % 40) + 20, GROUND - 10, x - (off % 40) + 40, GROUND + 2 + Math.sin((wx + off) / 90) * 2);
      }
      g.lineTo(W + 40, GROUND + 26);
      g.lineTo(-10, GROUND + 26);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(-10, GROUND);
      for (let x = -10; x <= W + 40; x += 40) g.quadraticCurveTo(x - (off % 40) + 20, GROUND - 10, x - (off % 40) + 40, GROUND + 2);
      g.stroke();
      // stones
      g.fillStyle = "rgba(255,244,220,.25)";
      for (let i = 0; i < 12; i++) {
        const x = ((i * 173 - off) % (W + 200)) + (i * 173 - off < 0 ? W + 200 : 0) - 100;
        g.beginPath();
        g.ellipse(x, GROUND + 50 + (i % 3) * 22, 18 + (i % 4) * 6, 8, 0, 0, Math.PI * 2);
        g.fill();
      }
    };
    const drawSprite = (image: HTMLImageElement, cx: number, bottom: number, w: number, rot = 0, sx = 1, sy = 1) => {
      if (!image.complete || !image.naturalWidth) return;
      const h = (image.naturalHeight / image.naturalWidth) * w;
      g.save();
      g.translate(cx, bottom);
      g.rotate(rot);
      g.scale(sx, sy);
      g.drawImage(image, -w / 2, -h, w, h);
      g.restore();
    };
    const plate = (text: string, cx: number, cy: number) => {
      g.font = "700 54px Andika";
      const tw = g.measureText(text).width;
      const w = tw + 40,
        h = 72;
      g.fillStyle = "#fff4dc";
      g.strokeStyle = "#2b1d14";
      g.lineWidth = 5;
      g.beginPath();
      g.roundRect(cx - w / 2, cy - h / 2, w, h, 16);
      g.fill();
      g.stroke();
      g.fillStyle = "#2b1d14";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(text, cx, cy + 2);
    };

    // ---- loop
    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const lanternOnScreen = lanterns.some((l) => !l.popped && l.x - dist < W + 60 && l.x - dist > -60);
      targetSpeed = finished ? 0 : lanternOnScreen ? (eventIdx === 0 ? 70 : 110) : heroS.hurtT > 0 ? 220 : 360;
      speed += (targetSpeed - speed) * Math.min(1, dt * 4);
      dist += speed * dt;

      // hero physics
      if (heroS.homing && !heroS.homing.popped) {
        const l = heroS.homing;
        const tx = l.x - dist,
          ty = l.y + 120;
        heroS.x += (tx - heroS.x) * Math.min(1, dt * 7);
        heroS.y += (ty - heroS.y) * Math.min(1, dt * 7);
        heroS.vy = 0;
        heroS.jumps = 2;
      } else {
        heroS.homing = null;
        heroS.x += (250 - heroS.x) * Math.min(1, dt * 2);
        heroS.vy += GRAV * dt;
        heroS.y += heroS.vy * dt;
        if (heroS.y >= GROUND) {
          if (heroS.jumps > 0 && heroS.vy > 400) fx.burst(heroS.x, GROUND, "dust", 4);
          heroS.y = GROUND;
          heroS.vy = 0;
          heroS.jumps = 0;
        }
      }
      heroS.hurtT = Math.max(0, heroS.hurtT - dt);

      // events
      if (!busy && !finished && gongX === null && dist > nextEventAt) startEvent();

      // collisions
      for (const th of things) {
        const sx = th.x - dist;
        if (th.got || sx < heroS.x - 60 || sx > heroS.x + 60) continue;
        if (th.kind === "petal") {
          if (Math.abs(th.y - (heroS.y - 90)) < 90) {
            th.got = true;
            collected++;
            setPetals(collected);
            sfx.coin();
            fx.burst(sx, th.y, "sparks", 6);
          }
        } else if (heroS.y > GROUND - 70 && heroS.hurtT <= 0) {
          th.got = true;
          heroS.hurtT = 0.9;
          sfx.bounce();
          fx.burst(sx, GROUND - 40, "dust", 8);
        }
      }
      for (const l of lanterns) {
        if (l.popped) continue;
        const sx = l.x - dist;
        if (Math.abs(sx - heroS.x) < 80 && Math.abs(l.y + 40 - (heroS.y - 90)) < 110) catchLantern(l);
        if (sx < -120 && !l.popped) {
          // missed them all: loop the lanterns round again
          if (lanterns.every((o) => o.popped || o.x - dist < -120)) {
            lanterns.forEach((o, i) => {
              if (!o.popped) o.x = dist + W + 150 + i * 420;
            });
            if (current) say(mode === "blend" ? [{ line: "listen_again" }, { sounds: current.segs, gap: 330 }] : [{ line: "run_catch" }, { gap: 450 }, { word: current.text }]);
          }
        }
      }
      if (gongX !== null && !finished && gongX - dist < heroS.x + 60) {
        finished = true;
        sfx.gong();
        fx.rain("petals", 60);
        (async () => {
          await say({ line: "run_end" });
          await sleep(300);
          const stars = firstTry >= EVENTS - 1 ? 3 : firstTry >= EVENTS - 3 ? 2 : 1;
          if (alive) onDone(stars);
        })();
      }

      // ---- draw
      g.clearRect(0, 0, W, H);
      g.save();
      g.filter = "saturate(0.9) brightness(1.03)";
      drawTiled(I.bg, dist * 0.25, 0, GROUND + 60);
      g.restore();
      drawGround(dist);
      for (const th of things) {
        const sx = th.x - dist;
        if (sx < -120 || sx > W + 120 || (th.got && th.kind === "petal")) continue;
        if (th.kind === "petal") drawSprite(I.petal, sx, th.y + 25 + Math.sin(t * 4 + th.x) * 5, 52, Math.sin(t * 2 + th.x) * 0.3);
        else drawSprite(th.kind === "crate" ? I.crate : I.spikes, sx, GROUND + 8, th.kind === "crate" ? 104 : 120, th.got ? 0.2 : 0);
      }
      for (const l of lanterns) {
        const sx = l.x - dist;
        if (sx < -160 || sx > W + 160 || l.popped) continue;
        const bob = Math.sin(t * 2.5 + l.phase) * 10;
        g.save();
        g.strokeStyle = "#2b1d14";
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(sx, 0);
        g.lineTo(sx, l.y - 70 + bob);
        g.stroke();
        g.restore();
        drawSprite(I.lantern, sx, l.y + 50 + bob, 120);
        if (mode === "blend") plate(l.word.text, sx, l.y + 90 + bob);
        else {
          const p = I.pics[l.word.text];
          g.fillStyle = "#fff4dc";
          g.strokeStyle = "#2b1d14";
          g.lineWidth = 5;
          g.beginPath();
          g.roundRect(sx - 70, l.y + 30 + bob, 140, 120, 18);
          g.fill();
          g.stroke();
          if (p?.complete) {
            const s = Math.min(120 / p.naturalWidth, 104 / p.naturalHeight);
            g.drawImage(p, sx - (p.naturalWidth * s) / 2, l.y + 38 + bob, p.naturalWidth * s, p.naturalHeight * s);
          }
        }
      }
      if (gongX !== null) drawSprite(I.gong, gongX - dist + 120, GROUND + 8, 220);
      // hero
      const air = heroS.y < GROUND - 2 || heroS.homing;
      const pose = finished ? I.cheer : heroS.hurtT > 0.4 ? I.hurt : air ? I.jump : I.run;
      const step = Math.sin(t * 18);
      g.save();
      g.globalAlpha = 0.35;
      g.fillStyle = "#2b1d14";
      g.beginPath();
      g.ellipse(heroS.x, GROUND + 4, 60 - (GROUND - heroS.y) / 8, 12, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
      drawSprite(pose, heroS.x, heroS.y + 8 + (air ? 0 : Math.abs(step) * -8), 170, air ? 0 : step * 0.05, 1, air ? 1 : 1 + Math.abs(step) * 0.03);
      if (alive) raf = requestAnimationFrame(frame);
    };
    document.fonts.load("700 54px Andika").finally(() => (raf = requestAnimationFrame(frame)));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        api.current.jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      hush();
    };
  }, []);

  useHelp((n) => (window as any).__snRunHelp?.(n));
  const onPointer = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    api.current.tapAt(x, y);
  };

  return (
    <div className="scene">
      <canvas ref={canvasRef} width={W} height={H} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} onPointerDown={onPointer} />
      <div className="topbar">
        <RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton>
        <div className="spacer" />
        <Progress value={progress} />
        <div className="spacer" />
        <div className="panel" style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 16px 4px 8px", borderRadius: 40 }}>
          <img src={img("item_petal")} alt="" style={{ width: 44 }} />
          <span className="display" style={{ fontSize: 34 }}>{petals}</span>
        </div>
      </div>
      {banner?.mode === "read" && (
        <div className="panel drop-in" style={{ position: "absolute", left: "50%", translate: "-50% 0", top: 96, padding: "6px 40px", fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: 84 }}>
          {banner.text}
        </div>
      )}
      {banner?.mode === "blend" && (
        <div style={{ position: "absolute", left: 110, top: 16 }}>
          <RoundButton sm label="Hear the sounds again" onClick={() => api.current.repeat()} className="pulse"><Icon.ear /></RoundButton>
        </div>
      )}
      <CaptionTop top={96} />
    </div>
  );
}
