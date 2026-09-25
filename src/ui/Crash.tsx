// If anything ever breaks, show a friendly screen (with the error for grown-ups) instead of a blank page.
import { Component, type ReactNode } from "react";
import { hush, playMusic } from "../engine/audio";

export class CrashGuard extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch() {
    try {
      hush();
      playMusic(null);
    } catch {}
  }
  render() {
    const e = this.state.error;
    if (!e) return this.props.children;
    const btn: React.CSSProperties = { font: "800 24px 'Baloo 2', sans-serif", padding: "14px 26px", borderRadius: 999, border: "4px solid #2b1d14", boxShadow: "0 5px 0 #2b1d14", cursor: "pointer" };
    return (
      <div style={{ position: "fixed", inset: 0, background: "#1d1230", color: "#fff4dc", display: "grid", placeItems: "center", padding: 20, fontFamily: "'Baloo 2', sans-serif", zIndex: 1000 }}>
        <div style={{ maxWidth: 640, textAlign: "center" }}>
          <img src="/a/i/sensei_talk.webp" alt="" style={{ width: 140 }} />
          <h1 style={{ fontFamily: "'Luckiest Guy', sans-serif", fontSize: 44, margin: "6px 0" }}>Oops! A muddle!</h1>
          <p style={{ fontSize: 20, margin: "0 0 18px" }}>Something went wrong. Let's try that again.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...btn, background: "#3fbf6a", color: "#fff" }} onClick={() => location.reload()}>Try again</button>
            <button style={{ ...btn, background: "#ffc53d" }} onClick={() => (location.href = "/play/?scene=profiles")}>Choose player</button>
          </div>
          <details style={{ marginTop: 22, textAlign: "left", fontSize: 13, opacity: 0.75 }}>
            <summary>For grown-ups: error details</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{e.message}{"\n"}{(e.stack ?? "").split("\n").slice(0, 6).join("\n")}{"\n"}{navigator.userAgent}</pre>
          </details>
        </div>
      </div>
    );
  }
}
