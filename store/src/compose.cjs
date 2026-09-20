// Step 2 of the store images: compose the captured panels into the sizes the Chrome Web Store asks for.
const { chromium } = require("playwright-core");
const path = require("node:path"), os = require("node:os"), fs = require("node:fs");
const REPO = path.resolve(__dirname, "../..");
const PARTS = path.join(__dirname, "parts");
const OUT = path.join(REPO, "store");
const CHROME = process.env.CHROME;
if (!CHROME) { console.error("Set CHROME to a Chrome or Chromium binary."); process.exit(1); }
const data = (file, type = "image/png") => `data:${type};base64,${fs.readFileSync(file).toString("base64")}`;
const part = (name) => data(path.join(PARTS, `${name}.png`));
const LOGO = data(path.join(REPO, "extension/icons/icon.svg"), "image/svg+xml");
const { link } = JSON.parse(fs.readFileSync(path.join(PARTS, "rects.json"), "utf8"));

const CSS = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
  * { box-sizing: border-box; margin: 0; }
  body { font-family: Inter, sans-serif; color: #f8fafc; overflow: hidden;
         background: radial-gradient(1200px 700px at 85% -10%, #123a36 0%, transparent 60%), linear-gradient(160deg, #0b1220 0%, #0f172a 55%, #111c33 100%); }
  .brand { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 20px; letter-spacing: .01em; }
  .brand img { width: 36px; height: 36px; border-radius: 9px; }
  h1 { font-weight: 800; letter-spacing: -.02em; line-height: 1.08; }
  h1 em { font-style: normal; color: #34d399; }
  p.sub { color: #cbd5e1; line-height: 1.45; }
  .window { background: #fff; border-radius: 14px 14px 0 0; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.08); }
  .bar { height: 40px; background: #e8eaed; display: flex; align-items: center; gap: 8px; padding: 0 14px; }
  .dot { width: 11px; height: 11px; border-radius: 50%; background: #c4c7cc; }
  .url { margin-left: 14px; flex: 1; height: 24px; border-radius: 12px; background: #fff; color: #5f6368; font-size: 12px; display: flex; align-items: center; padding: 0 12px; }
  .content { display: flex; background: #fff; }
  .page { flex: 1; padding: 22px 24px; background: #fff; }
  .player { position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden;
            background: radial-gradient(500px 300px at 30% 35%, #334155 0%, #0f172a 70%); }
  .play { position: absolute; left: 50%; top: 46%; width: 76px; height: 76px; margin: -38px; border-radius: 50%; background: rgba(255,255,255,.16); backdrop-filter: blur(2px); }
  .play:after { content: ""; position: absolute; left: 30px; top: 22px; border: 16px solid transparent; border-left: 26px solid #fff; border-right: 0; }
  .track { position: absolute; left: 16px; right: 16px; bottom: 18px; height: 5px; border-radius: 3px; background: rgba(255,255,255,.28); }
  .track i { position: absolute; top: 0; bottom: 0; left: 0; border-radius: 3px; background: #34d399; }
  .track b { position: absolute; top: -2px; width: 3px; height: 9px; background: #0f172a; }
  .knob { position: absolute; top: -5px; width: 15px; height: 15px; margin-left: -7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 5px rgba(52,211,153,.3); }
  .tip { position: absolute; bottom: 34px; transform: translateX(-50%); background: #0b1220; color: #fff; font-size: 13px; font-weight: 600; padding: 5px 9px; border-radius: 6px; white-space: nowrap; }
  .line { height: 14px; border-radius: 7px; background: #e5e7eb; margin-top: 12px; }
  .meta { display: flex; align-items: center; gap: 12px; margin-top: 18px; }
  .avatar { width: 40px; height: 40px; border-radius: 50%; background: #d1d5db; }
  .side { width: 400px; border-left: 1px solid #dadce0; position: relative; overflow: hidden; background: #fff; }
  .side img { display: block; width: 400px; }
  .ring { position: absolute; border: 3px solid #34d399; border-radius: 8px; box-shadow: 0 0 0 6px rgba(52,211,153,.25); }
  .frame { border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.08); }
  .frame img { display: block; width: 400px; }
  .tag { display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #34d399; background: rgba(52,211,153,.12); border: 1px solid rgba(52,211,153,.35); padding: 5px 10px; border-radius: 999px; }
  .bars { display: flex; align-items: center; gap: 10px; }
  .bars span { width: 14px; border-radius: 7px; background: #475569; }
  .bars span.s { background: #34d399; }
`;

const bars = (scale = 1) => `<div class="bars">${[28, 44, 92, 36, 24].map((h, i) => `<span class="${i === 2 ? "s" : ""}" style="height:${h * scale}px;width:${14 * scale}px;border-radius:${7 * scale}px"></span>`).join("")}</div>`;

/** A browser window: a stand-in video page on the left, the real captured panel on the right. */
function browser({ panel, offsetY = 0, height = 600, played = 0.22, seekTo, ring }) {
  const chapters = [0.06, 0.17, 0.32, 0.41, 0.56, 0.62, 0.73, 0.815, 0.95];
  return `<div class="window"><div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><div class="url">youtube.com/watch</div></div>
    <div class="content" style="height:${height}px"><div class="page"><div class="player"><div class="play"></div>
      <div class="track"><i style="width:${(seekTo ?? played) * 100}%"></i>${chapters.map((c) => `<b style="left:${c * 100}%"></b>`).join("")}
      <div class="knob" style="left:${(seekTo ?? played) * 100}%"></div>${seekTo ? `<div class="tip" style="left:${seekTo * 100}%">25:17</div>` : ""}</div></div>
      <div class="line" style="width:78%;height:18px;margin-top:18px"></div><div class="meta"><div class="avatar"></div><div style="flex:1"><div class="line" style="width:28%;margin-top:0"></div><div class="line" style="width:16%;height:10px;margin-top:8px"></div></div></div>
      <div class="line" style="width:92%"></div><div class="line" style="width:64%"></div></div>
    <div class="side"><img src="${part(panel)}" style="margin-top:${-offsetY}px">${ring ? `<div class="ring" style="left:${link.x - 8}px;top:${link.y - offsetY - 7}px;width:${link.w + 16}px;height:${link.h + 14}px"></div>` : ""}</div></div></div>`;
}

const headed = (title, sub, body) => `<div style="padding:44px 64px 0"><div class="brand"><img src="${LOGO}">Signal / Noise</div>
  <h1 style="font-size:46px;margin-top:22px">${title}</h1><p class="sub" style="font-size:20px;margin-top:12px;max-width:900px">${sub}</p></div>
  <div style="position:absolute;left:64px;right:64px;top:252px">${body}</div>`;

const SCENES = [
  { file: "screenshot-1-verdict.png", w: 1280, h: 800, html: headed("Is this video <em>worth your time?</em>", "One click, next to the video: a verdict, what is actually new, and what it changes.", browser({ panel: "complete-top" })) },
  { file: "screenshot-2-skip-list.png", w: 1280, h: 800, html: headed("Know exactly <em>what to skip</em>", "Every chapter that carries no new fact is named — so you can skip it with a clear conscience.", browser({ panel: "complete-skip", played: 0.4 })) },
  { file: "screenshot-3-timestamps.png", w: 1280, h: 800, html: headed("Click a timestamp. <em>The video jumps there.</em>", "Every claim is anchored to its chapter, so checking it costs one click instead of a rewatch.", browser({ panel: "complete-top", offsetY: 378, seekTo: 0.815, ring: true })) },
  { file: "screenshot-4-fast-and-language.png", w: 1280, h: 800, html: `<div style="display:flex;height:800px"><div style="width:440px;padding:64px 36px 0 64px"><div class="brand"><img src="${LOGO}">Signal / Noise</div>
      <h1 style="font-size:42px;margin-top:30px"><em>Fast</em> when you are in a hurry.<br>In <em>your language.</em></h1>
      <p class="sub" style="font-size:18px;margin-top:20px">Fast keeps only the essential. Complete gives you every block. Either way the whole video is judged by the same rules — and the summary comes in the language you choose, whatever the video is in.</p></div>
      <div style="flex:1;display:flex;gap:28px;justify-content:center;padding:70px 40px 0 0"><div><div class="tag">Fast</div><div class="frame" style="margin-top:14px;height:700px;width:360px"><img style="width:360px" src="${part("fast")}"></div></div>
      <div style="margin-top:46px"><div class="tag">Português</div><div class="frame" style="margin-top:14px;height:700px;width:360px"><img style="width:360px" src="${part("portuguese")}"></div></div></div></div>` },
  { file: "screenshot-5-one-key.png", w: 1280, h: 800, html: `<div style="display:flex;height:800px"><div style="width:600px;padding:64px 0 0 64px"><div class="brand"><img src="${LOGO}">Signal / Noise</div>
      <h1 style="font-size:50px;margin-top:30px">One key.<br><em>That is the whole setup.</em></h1>
      <p class="sub" style="font-size:21px;margin-top:22px">Paste a SipPulse AI key once and you are done. New accounts come with a <b style="color:#f8fafc">US$5 credit</b> — enough to evaluate a good number of videos before paying anything.</p>
      <p class="sub" style="font-size:17px;margin-top:26px;color:#94a3b8">The key stays in your browser. Nothing is sent anywhere until you click Evaluate, and then only that video's transcript.</p></div>
      <div style="flex:1;display:flex;justify-content:center;padding-top:130px"><div class="frame" style="height:500px"><img src="${part("settings-saved")}"></div></div></div>` },
  { file: "promo-small-440x280.png", w: 440, h: 280, html: `<div style="height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">${bars(0.62)}
      <div style="font-size:34px;font-weight:800;letter-spacing:-.02em">Signal <span style="color:#34d399">/</span> Noise</div><div style="font-size:16px;color:#cbd5e1">Is this video worth your time?</div></div>` },
  { file: "promo-marquee-1400x560.png", w: 1400, h: 560, html: `<div style="display:flex;height:560px"><div style="width:760px;padding:96px 0 0 90px">${bars(0.8)}
      <h1 style="font-size:60px;margin-top:30px">Signal <em>/</em> Noise</h1><p class="sub" style="font-size:27px;margin-top:16px;color:#f8fafc;font-weight:600">Is this video worth your time?</p>
      <p class="sub" style="font-size:20px;margin-top:16px;max-width:600px">A verdict, what is actually new, and the chapters to skip — next to the video, in your language.</p></div>
      <div style="flex:1;display:flex;justify-content:center;padding-top:56px"><div class="frame" style="height:560px"><img src="${part("complete-top")}"></div></div></div>` },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browserApp = await chromium.launch({ executablePath: CHROME });
  const page = await browserApp.newPage();
  for (const scene of SCENES) {
    await page.setViewportSize({ width: scene.w, height: scene.h });
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>${CSS} body{width:${scene.w}px;height:${scene.h}px;position:relative}</style>${scene.html}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, scene.file) });
    const png = fs.readFileSync(path.join(OUT, scene.file));
    console.log(scene.file.padEnd(38), `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, `color type ${png[25]}`, `${Math.round(png.length / 1024)} KB`);
  }
  // The store wants the 128px icon as 96px of artwork inside 16px of transparent padding.
  await page.setViewportSize({ width: 128, height: 128 });
  await page.setContent(`<style>*{margin:0}html{background:transparent}img{display:block;margin:16px;width:96px;height:96px}</style><img src="${LOGO}">`);
  await page.screenshot({ path: path.join(OUT, "store-icon-128.png"), omitBackground: true });
  console.log("store-icon-128.png");
  await browserApp.close();
})().catch((e) => { console.error("COMPOSE FAILED:", e); process.exit(1); });
