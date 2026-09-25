// "Get ready!" — shown before the game when it's running inside a browser tab (browser bars visible).
// Android/desktop: one-tap install or full screen. iPhone/iPad: Safari can't go full screen for web pages,
// so we show the Share → Add to Home Screen steps. Always offers "play here anyway".
import { useState } from "react";
import { img, tapProps, heroImg, useHelp } from "../ui/ui";
import { sfx, unlockAudio } from "../engine/audio";

export const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
export const isAndroid = () => /Android/i.test(navigator.userAgent);
export const isStandalone = () => (navigator as any).standalone === true || matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches || !!document.fullscreenElement;
export const needsSetup = () => {
  if (isStandalone() || new URLSearchParams(location.search).has("level") || new URLSearchParams(location.search).has("scene")) return false;
  try {
    return sessionStorage.getItem("sn.setup") !== "done";
  } catch {
    return true;
  }
};

export async function goFullscreen() {
  try {
    await document.documentElement.requestFullscreen({ navigationUI: "hide" } as FullscreenOptions);
    await (screen.orientation as any)?.lock?.("landscape").catch(() => {});
  } catch {}
}

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" style={{ verticalAlign: "-10px" }}><rect x="1" y="1" width="22" height="22" rx="6" fill="#fff" stroke="#2b1d14" strokeWidth="1.5" /><path d="M12 5v10M8 8.5l4-4 4 4M7 11.5v7h10v-7" fill="none" stroke="#1a7cf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" style={{ verticalAlign: "-10px" }}><rect x="1" y="1" width="22" height="22" rx="6" fill="#fff" stroke="#2b1d14" strokeWidth="1.5" /><rect x="6" y="6" width="12" height="12" rx="3" fill="none" stroke="#2b1d14" strokeWidth="1.8" /><path d="M12 9v6M9 12h6" stroke="#2b1d14" strokeWidth="1.8" strokeLinecap="round" /></svg>
);

export function Setup({ onDone }: { onDone: () => void }) {
  const [prompt] = useState(() => (window as any).__installPrompt as any);
  const ios = isIOS();
  useHelp(() => {});
  const android = isAndroid();
  const finish = () => {
    try {
      sessionStorage.setItem("sn.setup", "done");
    } catch {}
    unlockAudio();
    onDone();
  };
  const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700, lineHeight: 1.25 }}>
      <span style={{ flex: "none", width: 54, height: 54, borderRadius: "50%", display: "grid", placeItems: "center", background: "#ffc53d", border: "5px solid #2b1d14", fontFamily: "var(--font-display)", fontSize: 30 }}>{n}</span>
      <div>{children}</div>
    </div>
  );
  return (
    <div className="scene" style={{ background: "radial-gradient(ellipse at 30% 20%, #3b2463, #1d1230 70%)" }}>
      <img className="bg-img" src={img("title_bg")} alt="" style={{ filter: "blur(6px) brightness(.45)" }} />
      <img className="sprite bob" src={heroImg("suki", "cheer")} alt="" style={{ right: 40, bottom: 20, width: 250 }} />
      <div className="panel pop-in" style={{ position: "absolute", left: 150, right: 290, top: 40, bottom: 40, padding: "30px 40px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div className="display" style={{ fontSize: 52, color: "#ff7aa2" }}>Grown-ups: get ready!</div>
        <div style={{ fontSize: 26, color: "var(--ink-soft)", marginTop: -12 }}>Super Ninja plays best full screen, held sideways, with the sound on.</div>
        {ios ? (
          <>
            <Step n={1}>Tap <ShareIcon /> <b>Share</b> (bottom or top of the screen).</Step>
            <Step n={2}>Scroll down and tap <PlusIcon /> <b>Add to Home Screen</b>, then <b>Add</b>.</Step>
            <Step n={3}>Open <b>Super Ninja</b> from your home screen. No browser bars!</Step>
          </>
        ) : (
          <>
            {prompt && (
              <button
                className="btn-go-wide"
                {...tapProps(async () => {
                  sfx.great();
                  prompt.prompt();
                  await prompt.userChoice.catch(() => {});
                  (window as any).__installPrompt = null;
                })}
              >
                Install the Super Ninja app
              </button>
            )}
            <button
              className="btn-go-wide"
              style={{ background: "linear-gradient(180deg,#8fd0ff,#4a9df0 60%,#2d6fb8)" }}
              {...tapProps(async () => {
                sfx.great();
                await goFullscreen();
                finish();
              })}
            >
              Play full screen
            </button>
            {android && !prompt && <Step n={1}>Or tap <b>⋮</b> then <b>Add to Home screen</b> to make it an app.</Step>}
          </>
        )}
        <div style={{ flex: 1 }} />
        <button aria-label="Play here" {...tapProps(finish)} style={{ alignSelf: "flex-start", fontSize: 24, fontWeight: 800, textDecoration: "underline", color: "var(--ink-soft)" }}>
          No thanks, play here in the browser →
        </button>
      </div>
    </div>
  );
}
