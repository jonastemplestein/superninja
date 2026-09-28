// Landing page behaviour: scroll reveals, lazy gameplay videos, the story film, hero World Flower petals,
// the top bar, version stamp and site-wide sound.
declare const __APP_VERSION__: string;
const ver = document.getElementById("ver");
if (ver) ver.textContent = `v${__APP_VERSION__}`;

// numbers on the page come from the content (scripts/stats.ts), so they never go stale
fetch("/media/stats.json")
  .then((r) => r.json())
  .then((s) => document.querySelectorAll<HTMLElement>("[data-stat]").forEach((el) => s[el.dataset.stat!] != null && (el.textContent = String(s[el.dataset.stat!]))))
  .catch(() => {});

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// reveal sections as they scroll in
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  },
  { rootMargin: "0px 0px -8% 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// gameplay clips: load when near, play only while visible (saves data and battery on phones).
// A clip that may not play with its sound on goes on playing muted instead of freezing on its poster: iOS Safari
// pauses a clip that is unmuted outside a tap, and refuses play() on it (see `soundBlocked` below).
const soundBlocked = new WeakSet<HTMLVideoElement>();
let onBlocked = () => {};
function playClip(v: HTMLVideoElement) {
  v.play().catch(() => {
    if (v.muted || !v.src) return;
    soundBlocked.add(v);
    v.muted = true;
    v.play().catch(() => {});
    onBlocked();
  });
}
const vids = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) {
        if (v.dataset.src && !v.src) v.src = v.dataset.src;
        // (asked again as more of it shows: a card peeking in from the side of the carousel gets its play() while
        // it is a sliver, and some browsers hold that one back; it is not asked again unless the ratio is watched)
        if (v.paused) playClip(v);
      } else if (!v.paused) v.pause();
    }
  },
  { rootMargin: "200px 0px", threshold: [0, 0.5, 1] },
);
document.querySelectorAll<HTMLVideoElement>("video[data-src], video[autoplay]").forEach((v) => vids.observe(v));

// top bar: just the sound button over the hero sky; a paper bar with brand + Play once the hero has scrolled away
const hero = document.querySelector<HTMLElement>(".hero")!;
const bar = document.getElementById("bar")!;
let heroVisible = true;
new IntersectionObserver(
  ([e]) => {
    heroVisible = e.isIntersecting;
    bar.classList.toggle("solid", !e.isIntersecting);
    bar.querySelectorAll("a").forEach((a) => (a.tabIndex = e.isIntersecting ? -1 : 0));
    if (heroVisible && !reduced) requestAnimationFrame(tick);
  },
  { rootMargin: "-70px 0px 0px 0px" },
).observe(hero);

// a few World Flower petals (glowing teardrops in the school chart's colours) drifting across the hero art only
// (behind the words), and only while it's on screen
const canvas = document.getElementById("petals") as HTMLCanvasElement;
const g = canvas.getContext("2d")!;
const COLOURS = ["#e8312f", "#f5821f", "#f3c74a", "#2fa65a", "#2ec4b6", "#4a7dff", "#8a3be0", "#f0226b", "#6ec9f2", "#ff8fb8", "#9ae29a", "#c42fd1"];
type P = { x: number; y: number; s: number; vx: number; vy: number; r: number; vr: number; ph: number; c: string };
let ps: P[] = [];
let W = 0, H = 0;
const spawn = (anywhere = false): P => ({
  x: Math.random() * W * 1.1, y: anywhere ? Math.random() * H : -30, s: 10 + Math.random() * 14,
  vx: -0.25 - Math.random() * 0.4, vy: 0.35 + Math.random() * 0.5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.02, ph: Math.random() * 6,
  c: COLOURS[Math.floor(Math.random() * COLOURS.length)],
});
/** A teardrop petal (round end up, point down) centred on 0,0, s tall. */
function teardrop(s: number) {
  const w = s * 0.62, r = w / 2, h = s, cy = -h / 2 + r;
  g.beginPath();
  g.moveTo(0, h / 2);
  g.bezierCurveTo(-w * 0.12, h * 0.28, -r, h * 0.06, -r, cy);
  g.arc(0, cy, r, Math.PI, 0);
  g.bezierCurveTo(r, h * 0.06, w * 0.12, h * 0.28, 0, h / 2);
  g.closePath();
}
const resize = () => {
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  canvas.width = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;
  ps = Array.from({ length: Math.round(Math.max(6, Math.min(14, W / 90))) }, () => spawn(true));
};
addEventListener("resize", resize);
resize();
let t = 0;
let running = false;
function tick() {
  if (running) return;
  running = true;
  const frame = () => {
    if (!heroVisible || document.hidden) { running = false; return; }
    t++;
    g.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    g.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.x += p.vx + Math.sin(t / 70 + p.ph) * 0.35;
      p.y += p.vy;
      p.r += p.vr;
      if (p.y > H + 30 || p.x < -30) Object.assign(p, spawn());
      g.save();
      g.globalAlpha = 0.7;
      g.translate(p.x, p.y);
      g.rotate(p.r);
      teardrop(p.s * 1.3);
      const grd = g.createLinearGradient(0, -p.s * 0.65, 0, p.s * 0.65);
      grd.addColorStop(0, "#fff");
      grd.addColorStop(0.45, p.c);
      g.fillStyle = grd;
      g.shadowColor = p.c;
      g.shadowBlur = 8;
      g.fill();
      g.shadowBlur = 0;
      g.lineWidth = 1.4;
      g.strokeStyle = "rgba(43,29,20,.55)";
      g.stroke();
      g.restore();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
if (!reduced) tick();
document.addEventListener("visibilitychange", () => !document.hidden && heroVisible && !reduced && tick());

// ---------- sound: the whole site has sound. Browsers only allow it after the first tap/click/key,
// so the first interaction anywhere switches it on (and the button toggles it).
const soundBtn = document.getElementById("sound") as HTMLButtonElement;
const soundLabel = soundBtn.querySelector(".s-label")!;
const music = new Audio("/a/m/title.mp3");
music.loop = true;
music.volume = 0.35;
let soundOn = false;
let userChose = false;
const film = document.getElementById("film-video") as HTMLVideoElement;
const allVideos = [...document.querySelectorAll<HTMLVideoElement>("video")];
const visibility = new Map<HTMLVideoElement, number>();
const filmPlaying = () => !film.paused && !film.ended && (visibility.get(film) ?? 0) > 0;
const loudest = () => {
  if (filmPlaying()) return film;
  let best: HTMLVideoElement | null = null;
  let bestV = 0.35;
  for (const [v, r] of visibility) if (v !== film && r > bestV && !soundBlocked.has(v)) { best = v; bestV = r; }
  return best;
};
function applySound() {
  soundBtn.setAttribute("aria-pressed", String(soundOn));
  soundLabel.textContent = soundOn ? "Sound on" : "Tap for sound";
  const lead = soundOn ? loudest() : null;
  for (const v of allVideos) {
    const unmuting = v === lead && v.muted;
    v.muted = v !== lead;
    if (v === lead) v.volume = 1;
    // (iOS Safari pauses a clip that is unmuted outside a tap: play it again, or on muted if that's refused)
    if (unmuting && v !== film && v.src && v.paused) playClip(v);
  }
  if (soundOn && lead !== film) {
    music.play().catch(() => {});
    music.volume = lead ? 0.08 : 0.35; // duck the music under a video that's speaking
  } else music.pause(); // the story film has its own music
}
onBlocked = applySound;
const vis = new IntersectionObserver(
  (es) => {
    for (const e of es) visibility.set(e.target as HTMLVideoElement, e.intersectionRatio);
    if (film.paused === false && (visibility.get(film) ?? 0) === 0) film.pause(); // scrolled away from the film
    applySound();
  },
  { threshold: [0, 0.25, 0.5, 0.75, 1] },
);
allVideos.forEach((v) => vis.observe(v));
soundBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  userChose = true;
  soundOn = !soundOn;
  applySound();
});
// The first tap, click or key anywhere switches the sound on (the sound button decides for itself). A touch counts
// when it lifts, and only as a tap, not the end of a scroll: that's when browsers allow sound. Every tap also unlocks
// every clip, because iOS Safari lets a clip be unmuted later (when it scrolls into view) only if it has been unmuted
// inside a tap before; otherwise it pauses it, and the clip sits there like a picture.
const gesture = (e: Event) => {
  if (e.type === "pointerdown" && (e as PointerEvent).pointerType !== "mouse") return;
  if ((navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation?.isActive === false) return;
  for (const v of allVideos) {
    const m = v.muted;
    v.muted = !m;
    v.muted = m;
    soundBlocked.delete(v);
  }
  if (!userChose && !soundBtn.contains(e.target as Node)) soundOn = true;
  applySound();
};
for (const type of ["pointerdown", "touchend", "click", "keydown"]) addEventListener(type, gesture, true);
// try immediately too: some browsers allow sound for returning visitors
music.play().then(() => {
  soundOn = true;
  applySound();
}).catch(() => {});
document.addEventListener("visibilitychange", () => (document.hidden ? music.pause() : soundOn && applySound()));

// the story film: a poster with a big play button; tapping plays it with sound
const filmBox = film.closest(".film")!;
filmBox.querySelector(".film-play")!.addEventListener("click", () => {
  if (!film.src) film.src = film.dataset.film!;
  film.controls = true;
  filmBox.classList.add("playing");
  soundOn = true;
  userChose = true;
  visibility.set(film, 1);
  film.muted = false;
  film.play().catch(() => {});
  applySound();
});
for (const ev of ["play", "pause", "ended"]) film.addEventListener(ev, applySound);
film.addEventListener("ended", () => {
  film.controls = false;
  filmBox.classList.remove("playing");
});
