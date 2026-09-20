// Render the extension's PNG icons from their two SVG sources, using a Chrome
// you already have — a Chrome extension's one guaranteed dependency.
//
//   CHROME=/path/to/chrome node scripts/render-icons.mjs
//
// icon-small.svg is drawn on the pixel grid and feeds the toolbar sizes;
// icon.svg feeds the rest. The PNGs are committed, so run this only after
// editing an SVG.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ICONS = "extension/icons";
const SIZES = [
  [16, "icon-small.svg"],
  [32, "icon-small.svg"],
  [48, "icon.svg"],
  [128, "icon.svg"],
];

const chrome = process.env.CHROME;
if (!chrome) {
  console.error("Set CHROME to a Chrome or Chromium binary, e.g. CHROME=$(which google-chrome).");
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "icons-"));
for (const [size, source] of SIZES) {
  const page = join(work, `${size}.html`);
  writeFileSync(
    page,
    `<style>*{margin:0}html{background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>` +
      readFileSync(join(ICONS, source), "utf8"),
  );
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--default-background-color=00000000",
      `--window-size=${size},${size}`,
      `--screenshot=${join(process.cwd(), ICONS, `icon-${size}.png`)}`,
      pathToFileURL(page).href,
    ],
    { stdio: "ignore" },
  );
  console.log(`${ICONS}/icon-${size}.png`);
}
