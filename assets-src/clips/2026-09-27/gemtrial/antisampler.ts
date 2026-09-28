// (Copied from ../boss/antisampler.ts, itself from ../ears/antisampler.ts, where the ears editor traced it on 27 Sep; kept here so this editor's takes
// don't change if that file does.)
//
// The screencast drops frames for ~250 ms at a time whenever one small region (the ninja's idle breathing, Sensei's
// speaking rings) has been the only thing changing for about a second: Chrome's capturer (viz FrameSinkVideoCapturer →
// the VideoCaptureOracle's AnimatedContentSampler, meant for a video playing in a tab) then "detects animated content"
// and samples only frames whose damage is exactly that region; the rest of the page's frames are thrown away until the
// detection lapses.
//
// The fix, for filming only: make every frame's damage the whole page. Two specks nobody can see (1 CSS px, ~1% black),
// one in the top-left corner and one in the bottom-right, fade by a hair all the time (a compositor animation): each
// frame's damage is then their bounding box, the full frame.
export function antiSampler() {
  const add = () => {
    if (document.getElementById("__speck_a") || !document.body) return;
    const st = document.createElement("style");
    st.textContent = "@keyframes __speck{from{opacity:.006}to{opacity:.016}}";
    document.head.appendChild(st);
    for (const [id, where] of [["__speck_a", "left:0;top:0"], ["__speck_b", "right:0;bottom:0"]]) {
      const d = document.createElement("div");
      d.id = id;
      d.setAttribute("aria-hidden", "true");
      d.style.cssText = `position:fixed;${where};width:1px;height:1px;background:#000;pointer-events:none;z-index:2147483645;will-change:opacity;animation:__speck 97ms linear infinite alternate`;
      document.body.appendChild(d);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add);
  else add();
}

/** How long each sound the game starts will play (window.__bufDur[sid], seconds), by the rig's source id (__sid): the
 *  drive waits for a pure sound to end before the child's next tap. Wraps the rig's own AudioBufferSourceNode.start. */
export function bufferDurations() {
  const w = window as any;
  const AB = w.AudioBufferSourceNode?.prototype;
  if (!AB || AB.__durWrapped) return;
  AB.__durWrapped = true;
  const start = AB.start;
  w.__bufDur = {};
  AB.start = function (...a: any[]) {
    const r = start.apply(this, a);
    try {
      if (this.__sid) w.__bufDur[this.__sid] = (this.buffer?.duration ?? 0) / (this.playbackRate?.value || 1);
    } catch {}
    return r;
  };
}
