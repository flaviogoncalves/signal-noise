// Step 1 of the store images: capture the REAL panel of the built extension in the states the listing shows.
const { chromium } = require("playwright-core");
const path = require("node:path"), os = require("node:os"), fs = require("node:fs");
const REPO = path.resolve(__dirname, "../..");
const EXT = path.join(REPO, "extension");
const OUT = path.join(__dirname, "parts");
const CHROME = process.env.CHROME;
if (!CHROME) { console.error("Set CHROME to a Chrome or Chromium binary."); process.exit(1); }
const VIDEO = "5d6y3poKwK4";
const link = (t, label) => `[${label}](https://www.youtube.com/watch?v=${VIDEO}&t=${t}s)`;

const COMPLETE = fs.readFileSync(path.join(REPO, "examples/output-summary.md"), "utf8").split("\n---\n")[1].trim();

// Fast mode and Portuguese: the same facts as the real example above, in the shape the skill's Fast mode defines.
const FAST = `**Video transcript (interview) | 5,919 words → ~130 words · Fast**

## Verdict

**The summary below is the whole thing.** One disclosure clears both gates. 31 min → ~30 sec.

## What is new — and what it changes

Stripe disclosed that **new businesses starting on Stripe are running at just under 2x year-over-year** — its largest jump on record, against ~50% during COVID — and the *median* new business is doing better, not worse (${link(1517, "25:17 Why It's Never Been a Better Time to Start a Company")}).

**Which means:** anyone arguing that AI is consolidating the economy into a few winners is arguing against the payment rails' own numbers.

## Signal

- **25% of all Delaware corporations** are now incorporated through Stripe Atlas (${link(1147, "19:07 The Hidden Reward of Building Stripe")}).
- Collison's own read, **no figures attached**: expect "many thousands of winners" (${link(1763, "29:23 What Stripe's Data Says About the AI Economy")}).

## Cut

Career advice, origin story, forecasts. Complete adds: the skip list and two tensions.`;

const PT = `**Transcrição de vídeo (entrevista) | 5.919 palavras → ~210 palavras (~3,5%)**

## Veredito

**O resumo abaixo é tudo.** Uma única revelação passa pelos dois filtros. O resto dos 31 minutos é contexto, conselho de carreira ou previsão. 31 min → ~45 s.

## O que é novo — e o que muda

A Stripe revelou dados internos: **novos negócios começando na Stripe crescem pouco menos de 2x ano a ano** — o maior salto já registrado, contra ~50% durante a COVID. E não é diluição: o negócio **mediano** vai melhor do que há um ano (${link(1517, "25:17 Why It's Never Been a Better Time to Start a Company")}).

**O que isso significa:** quem afirma que a IA está concentrando a economia em poucos vencedores está discutindo com os números dos próprios trilhos de pagamento.

## Sinal

- **25% de todas as empresas de Delaware** já são abertas pelo Stripe Atlas (${link(1147, "19:07 The Hidden Reward of Building Stripe")}).`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), "sn-store-")), {
    executablePath: CHROME, headless: true, locale: "en-US", viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, "--headless=new", "--mute-audio", "--disable-blink-features=AutomationControlled"],
  });
  let summary = COMPLETE;
  await context.route("https://api.sippulse.ai/**", async (route) => {
    if (route.request().url().endsWith("/models")) return route.fulfill({ json: { object: "list", data: [{ id: "deepseek-v4.1-flash" }] } });
    const parts = summary.match(/[\s\S]{1,60}/g);
    return route.fulfill({ status: 200, contentType: "text/event-stream",
      body: parts.map((content) => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`).join("") + `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] })}\n\ndata: [DONE]\n\n` });
  });
  let [worker] = context.serviceWorkers();
  worker ??= await context.waitForEvent("serviceworker", { timeout: 15000 });
  const extensionId = new URL(worker.url()).host;

  const video = await context.newPage();
  await video.goto(`https://www.youtube.com/watch?v=${VIDEO}`, { waitUntil: "domcontentloaded" });
  const panel = await context.newPage();
  await panel.addInitScript(() => {
    const query = chrome.tabs.query.bind(chrome.tabs);
    chrome.tabs.query = async () => (await query({})).filter((tab) => /youtube\.com\/watch/.test(tab.url ?? "")).slice(0, 1);
  });
  await panel.setViewportSize({ width: 400, height: 720 });
  await panel.goto(`chrome-extension://${extensionId}/panel.html`);
  // The panel uses the system font, which differs per OS. Render it in one good face for the listing.
  await panel.addStyleTag({ content: `@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"); body, button, select, input { font-family: Inter, system-ui, sans-serif !important; } ::-webkit-scrollbar { display: none; }` });
  await panel.evaluate(() => document.fonts.ready);
  const shot = (name) => panel.screenshot({ path: path.join(OUT, `${name}.png`) });
  const settle = () => panel.waitForFunction(() => /good|bad/.test(document.querySelector("#status").className) && !/Evaluating|Fetching/.test(document.querySelector("#status").textContent), null, { timeout: 60000 });
  const evaluate = async (text) => {
    summary = text;
    for (let attempt = 1; attempt <= 4; attempt++) {
      await video.bringToFront();
      await panel.evaluate(() => { document.querySelector("#status").className = "pending"; document.querySelector("#evaluate").click(); });
      await settle();
      const status = await panel.locator("#status").innerText();
      if (/^Done/.test(status)) break;
      console.log(`  attempt ${attempt} did not finish: ${status}`);
      await video.reload({ waitUntil: "domcontentloaded" });
    }
    await panel.evaluate(() => window.scrollTo(0, 0));
  };

  // 1. Settings, before and after the key is saved.
  await panel.fill("#key", "sk-live-" + "x".repeat(34));
  await shot("settings-empty");
  await panel.click("#save-key");
  await panel.waitForFunction(() => /Key saved/.test(document.querySelector("#status").textContent));
  await panel.locator("#settings summary").click();
  await shot("settings-saved");
  await panel.locator("#settings summary").click();

  // 2. Complete, top of the summary — and scrolled to the skip list.
  await evaluate(COMPLETE);
  console.log("complete:", await panel.locator("#status").innerText(), "|", await panel.locator("#details").innerText());
  await shot("complete-top");
  fs.writeFileSync(path.join(OUT, "rects.json"), JSON.stringify(await panel.evaluate(() => { const r = document.querySelector("#summary a").getBoundingClientRect(); return { link: { x: r.x, y: r.y, w: r.width, h: r.height } }; })));
  await panel.evaluate(() => { const h = [...document.querySelectorAll("#summary h2")].find((n) => /skip list/i.test(n.textContent)); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 330); });
  await shot("complete-skip");

  // 3. Fast.
  await panel.check("#mode-fast", { force: true });
  await evaluate(FAST);
  await shot("fast");

  // 4. Portuguese, Complete.
  await panel.check("#mode-complete", { force: true });
  await panel.selectOption("#language", "pt-BR");
  await evaluate(PT);
  await shot("portuguese");

  const names = fs.readdirSync(OUT).filter((f) => f.endsWith(".png"));
  const visible = await panel.evaluate(() => document.body.innerText);
  console.log("captured:", names.join(", "), "| model named on screen:", /deepseek|flash/i.test(visible));
  await context.close();
})().catch((e) => { console.error("CAPTURE FAILED:", e); process.exit(1); });
