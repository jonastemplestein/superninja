// Social share image (1200x630) from the landing hero.
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();
await p.goto((process.argv[2] ?? "http://localhost:5173") + "/", { waitUntil: "networkidle" });
await p.addStyleTag({ content: ".topnav,.scroll-cue,#petals,.promises,#sound,.sound-pill,[id*=sound]{display:none!important} .hero{min-height:630px} .hero-inner{padding:30px 0}" });
await p.waitForTimeout(2000);
await p.screenshot({ path: "public/media/og.jpg", type: "jpeg", quality: 85 });
await b.close();
