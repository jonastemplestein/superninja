// The confirm's standalone page (docs/CONFIRM.md §3.5): the game's shell (the Stage, Help, the nav layer, the effects)
// around src/scenes/ConfirmDemo.tsx, until App routes it as ?scene=confirm-demo. ?auto=1 leaves out the ConfirmLayer, so
// confirm() mounts its own (the path every screen takes before App mounts one).
// Build: bunx vite build --config playtest/confirm/vite.config.ts; serve: bun playtest/confirm/serve.ts --port 49xx.
import "../../src/engine/fast"; // first: ?fast=N
import { createRoot } from "react-dom/client";
import "../../src/styles.css";
import { Stage, FxLayer, HelpButton } from "../../src/ui/ui";
import { NavLayer } from "../../src/ui/nav";
import { ConfirmLayer } from "../../src/ui/Confirm";
import { ConfirmDemo } from "../../src/scenes/ConfirmDemo";

declare global {
  const __APP_VERSION__: string;
}
const auto = new URLSearchParams(location.search).has("auto");
function Shell() {
  return (
    <Stage worldColour="#6cc04a">
      <ConfirmDemo onHome={() => location.reload()} />
      <HelpButton />
      <NavLayer home={() => location.reload()} scene="confirm-demo" />
      {!auto && <ConfirmLayer />}
      <FxLayer />
    </Stage>
  );
}
createRoot(document.getElementById("root")!).render(<Shell />);
