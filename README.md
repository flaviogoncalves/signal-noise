<p align="center">
  <img src="./extension/icons/icon-128.png" alt="Signal / Noise logo: four grey bars of noise and one tall green bar of signal" width="96">
</p>

# Signal / Noise

Turn a YouTube video into a decision about whether to watch it.

Signal / Noise is a Chrome extension. Open a video, click one button, and a side panel beside the player answers one question — **is this worth 31 minutes, and if not, which 90 seconds are?** — with a verdict, what is actually new, and the chapters to skip. Click a timestamp in the answer and the video jumps there.

It reads the captions the video already has, which takes about a second, and judges them with AI running on [SipPulse AI](https://sippulse.ai). The only thing you set up is a SipPulse AI key — free to get, and it comes with a US$5 credit, enough to evaluate a good number of videos before you pay anything.

**[Install it in 5 minutes ↓](#install-it-in-5-minutes)** — no programming knowledge needed.

Signal / Noise is the first *app da quinzena* — app of the fortnight — built on SipPulse AI.

## The ten-second version

A 31-minute Y Combinator interview, 5,919 words. Here is the whole output:

> **Verdict — the summary below is the whole thing.** One disclosure clears both gates. Everything
> else in 31 minutes is background, career advice, or forecasting. 31 min → ~45 sec.
>
> **What is new — and what it changes.** Stripe disclosed internal data showing new businesses
> starting on Stripe at **just under 2x year-over-year**, its largest recorded jump, against ~50%
> during COVID — and not dilution: the *median* business is doing better and $1M/$5M/$10M
> threshold-crossing is rising ([25:17](https://www.youtube.com/watch?v=5d6y3poKwK4&t=1517s)).
>
> **Which means:** anyone arguing AI is consolidating the economy into a few winners is arguing
> against the payment rails' own numbers — and with **25% of all Delaware corporations** now
> incorporated through Stripe Atlas, this is closer to a census of US company formation than to one
> vendor's book.
>
> **Skip list —** `0:00 Intro` · `0:07 What Should You Still Learn` · `5:12 Should You Drop Out` ·
> `9:58 Why Stripe Worked` · `17:20 Is the Lean Startup Still the Right Playbook?` (speculation,
> explicitly "I don't know") · `22:36 Will AI Kill Your Startup?` · `30:45 Build Something People Truly Need`

See [`examples/`](./examples/) for [the input shape](./examples/input-transcript.md) and [the full output](./examples/output-summary.md), which was not hand-edited. The source transcript belongs to Y Combinator and is not redistributed here; one command regenerates it.

Note what happened to `17:20`. It is the most quotable chapter in the video, and it is in the skip list — because the speaker says "I don't know" and offers no data. That is the entire point.

## Install it in 5 minutes

You do not need to know anything about programming. There are three parts: get a free key, put the extension in Chrome, and use it.

You need **Google Chrome on a computer** — Windows, Mac or Linux. It does not work on a phone or tablet.

### Part 1 — Get your free key (2 minutes)

The key is what lets the extension use SipPulse AI. A new account comes with a **US$5 credit**, so you can evaluate a good number of videos before paying anything.

1. Open **[sippulse.ai/register](https://sippulse.ai/register)**.
2. Sign up with **Google**, **Microsoft**, or your **email**. If you use email, a 6-digit code arrives in your inbox — type it in within 10 minutes.
3. Fill in the short form: your name, an organization name (type anything — your own name is fine), language, currency and phone.
   **Pick the currency carefully. It cannot be changed afterwards.**
4. You are now inside SipPulse AI, and the credit is already in your account. In the menu on the left, click **API Keys**.
5. Click the **Generate API Key** button.
6. Type a name for it, for example `Signal Noise`, and click **Create**.
7. Your key appears on the screen. **Copy it now and keep this tab open** — it is shown in full only this one time. (If you lose it, no harm done: delete it and generate another.)

### Part 2 — Put the extension in Chrome (2 minutes)

1. **Download it.** Click **[Download Signal / Noise (ZIP)](https://github.com/flaviogoncalves/signal-noise/archive/refs/heads/main.zip)**. A file named `signal-noise-main.zip` goes to your **Downloads** folder.
2. **Unzip it.**
   - **Windows:** right-click the file, choose **Extract All…**, then click **Extract**.
   - **Mac:** double-click the file.

   You now have a folder named `signal-noise-main`.
3. **Move that folder somewhere it can stay**, such as **Documents**. Chrome runs the extension from this folder: if you delete or move it later, the extension stops working.
4. Open Chrome, click the address bar at the top, type **`chrome://extensions`** and press **Enter**. (You have to type or paste it — Chrome does not allow it to be a clickable link.)
5. In the **top-right** corner of that page, switch on **Developer mode**. A row of buttons appears at the top-left.
6. Click **Load unpacked**.
7. A window opens for you to choose a folder. Open `signal-noise-main`, click **once** on the folder called **`extension`** to highlight it, and click **Select Folder** (on a Mac: **Select**).
   Choose the `extension` folder *inside* — not `signal-noise-main` itself.
8. A card named **Signal / Noise** appears on the page. It is installed.
9. **Pin it so you can find it.** Click the **puzzle-piece icon** near the top-right corner of Chrome, find **Signal / Noise** in the list, and click the **pin** next to it. The icon — one green bar among grey ones — now stays in your toolbar.

> When Chrome starts, it may show a warning about "developer mode extensions". That is Chrome's standard notice for any extension installed this way rather than from the Web Store. Dismiss it; the extension keeps working.

### Part 3 — Paste your key and evaluate a video (1 minute)

1. Click the **Signal / Noise icon** in the toolbar. A panel opens on the right side of Chrome, with **Settings** already open.
2. Paste your key into the **SipPulse AI key** box and click **Save key**. The panel confirms with **Key saved**. You only do this once.
3. Open any video on **YouTube**.
4. Click **Evaluate this video**. Within a few seconds the verdict starts appearing in the panel, next to the video.
5. Click any **blue timestamp** in the summary and the video jumps to that moment.

That is all. From now on it is steps 3 to 5: open a video, click the icon, click **Evaluate this video**.

### Updating to a new version

Download the ZIP again, unzip it, and replace the old `signal-noise-main` folder with the new one, in the same place. Then open `chrome://extensions` and click the **circular arrow** on the Signal / Noise card. Your key and preferences are kept.

## Using it

<p align="center">
  <img src="./docs/images/panel.png" alt="The Signal / Noise side panel: a Complete/Fast switch, an output language menu, an 'Evaluate this video' button, and a streamed summary with a verdict and clickable chapter anchors." width="380">
</p>

Two choices sit above the **Evaluate this video** button, and both are remembered:

- **Complete / Fast.** Complete is the full evaluation: verdict, what is new, thesis, signal, skip list, numbers, tensions. Fast keeps only the essential — verdict, what is new, at most five lines of signal — and ends with one line saying what Complete would add. Fast reports less; it does not read less. Both judge the whole transcript by the same rules.
- **Output language.** Your browser's language by default, a language you pick, or "same as the video". Chapter titles, quotes and technical terms stay in the original either way, so anchors still match what YouTube shows you.

**Copy transcript** puts the episode's full transcript on your clipboard, for pasting into anything else. **Copy summary** copies the evaluation as Markdown.

The extension asks for four permissions — `sidePanel`, `scripting`, `storage`, and `clipboardWrite` — and is restricted to two hosts: `https://www.youtube.com/*` and `https://api.sippulse.ai/*`. It has no server of its own and no analytics. The key is stored in this browser only, never synced, and **Remove key** deletes it. Nothing leaves for SipPulse AI until you click Evaluate, and then what leaves is the transcript of that one video; Copy transcript talks to nobody but YouTube.

<details>
<summary><strong>If it does not work</strong></summary>

- **"Manifest file is missing or unreadable"** — in Part 2, step 7, the wrong folder was selected. Click **Load unpacked** again and choose the folder called `extension` that is *inside* `signal-noise-main`.
- **The Signal / Noise card has disappeared, or shows an error** — the `signal-noise-main` folder was moved or deleted. Put it back, or repeat Part 2 from step 6.
- **Clicking the icon does nothing** — make sure Chrome is up to date (**⋮ menu → Help → About Google Chrome**); the side panel needs Chrome 116 or newer.
- **"Open a YouTube video first"** — expected on any other page. It only acts on `youtube.com/watch` pages.
- **"SipPulse AI rejected the key"** — open **Settings** at the top of the panel and save the key again; saving re-checks it. **Remove key**, next to it, deletes the key from the browser.
- **A message saying the key cannot use the model** — the key itself is fine, but the account behind it does not have access to the model the extension runs on. Contact SipPulse AI support to have it enabled.
- **"The SipPulse AI organization is out of credits"** — the US$5 starter credit has been used up. Add credit inside SipPulse AI and click **Evaluate this video** again; nothing needs changing in the extension.
- **The summary says it was cut off** — the model hit its output limit. Try Fast.
- **"This episode has no captions"** — also expected, and not a bug. Signal / Noise reads transcripts that already exist; it never generates them. See [ADR 0002](./docs/adr/0002-harvest-only-never-transcribe.md).
- **It stopped working after a YouTube change** — possible; this is unofficial and uses no documented API. See [Reliability](#reliability).
- **You edited the source code** — run `npm run build`, then click the circular arrow on the extension card in `chrome://extensions`.

</details>

## How it judges a video

The premise: a bad summary gets shorter by cutting content; a good one gets shorter by cutting rhetorical redundancy and keeping 100% of what carries weight.

Five rules do most of the work:

- **Two gates: new AND relevant.** A claim must be something the viewer could not already have known, *and* something with a consequence. New-but-inconsequential is trivia and gets cut; relevant-but-old is labelled background rather than promoted. Relevance is judged generally, never against one viewer's assumed interests — the summary names *who* is affected and *what changes*, so anyone can tell in one line whether it concerns them. When nothing clears both gates, saying "nothing here is new" is the whole output, and a valuable one.
- **The Verdict is a decision, not a hedge.** One of three calls — watch it all, skim these chapters, or the summary is the whole thing — chosen on fact density rather than on how good the talk was. "Worth watching in full" has to be earned by something a transcript cannot carry: a demo, a document on screen, tone that changes the meaning.
- **Opinion is noise until it is earned.** Every claim faces one test: *could this be false, and could someone check?* Numbers, dates, mechanisms and decisions are signal. Forecasts, takes and career advice are not — unless they rest on data the speaker uniquely has, or are the speaker describing their own conduct. Cutting an opinion is fine; restating it without its hedge is not.
- **Anchors are chapter-accurate or absent.** Captions carry no usable per-sentence timestamps, so an exact `mm:ss` for a claim could only be guessed. Claims are matched to the chapter whose *title* names them, never to a position estimated from how far down the text sits. A link that looks exact and is wrong is worse than no link. A video with no chapters gets a summary with no anchors, and says so.
- **Nothing quantitative is ever rounded away.** Numbers keep their units and context, conditionals keep their exceptions, hedges keep their hedging, and contradictions in the source are recorded rather than smoothed into a consensus that was never reached.

These rules are not buried in code. They are one readable file, [`skills/signal-noise/SKILL.md`](./skills/signal-noise/SKILL.md), and the extension sends that exact file to the model — so what you read there is what judges your video. See [ADR 0005](./docs/adr/0005-the-skill-file-is-the-prompt.md).

## Reliability

This is unofficial. It uses no documented API, and it can stop working without notice if YouTube changes how captions are served. There is no server, no browser automation and no headless Chrome involved — a request goes out and a transcript comes back, typically in about a second.

The code is here if you want to know more: the network layer is [`src/youtube/fetchEpisode.ts`](./src/youtube/fetchEpisode.ts).

## Scope

**Does:**

- Evaluate the open YouTube video in a side panel, Complete or Fast, in the language you choose
- Fetch the existing transcript for any YouTube video, headless, in batch
- Prefer human-written captions in the original language; never silently hand you a translation
- Refuse plainly when an episode has no captions

**Deliberately does not:**

- **Transcribe.** No speech-to-text, no audio — see [ADR 0002](./docs/adr/0002-harvest-only-never-transcribe.md). Uncaptioned episodes are refused, not guessed at.
- **Anything but YouTube.** No Spotify, no Apple Podcasts.
- **Offer a choice of provider or model.** One key, one model, found among the models the key can use — see [ADR 0004](./docs/adr/0004-the-extension-evaluates-through-sippulse-ai.md).
- **Look things up.** The rules include a `Verified addition` block for checking a term against an outside source. The extension has no way to do that, so the block is switched off rather than filled from the model's memory — see [ADR 0005](./docs/adr/0005-the-skill-file-is-the-prompt.md).

## Optional extras

Neither is needed to use the extension.

**A command-line transcript fetcher.** The same harvesting code runs headless, for batches and for piping into other tools. Requires Node 18+.

```bash
git clone https://github.com/flaviogoncalves/signal-noise.git
cd signal-noise
npm install && npm run build

node dist/cli.js "https://www.youtube.com/watch?v=5d6y3poKwK4"   # print to stdout
node dist/cli.js <url> <url> --out ~/Documents/podcasts           # one Markdown file per episode
```

It is called `yttranscribe`, a mild misnomer kept because it is short: it harvests transcripts and never transcribes.

**The rules, in an agent of your own.** [`skills/signal-noise/`](./skills/signal-noise/) is a standard [Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) folder, so an agent that loads skills can apply the same rules to things the extension does not cover — contracts, papers, proposals, meeting transcripts — using the per-type rules in `references/source-types.md`. This is where the project started; the extension made it unnecessary for video.

## Development

```bash
npm test          # 80 tests
npm run typecheck
npm run build     # CLI to dist/, extension to extension/js/
```

Pure logic is tested — caption parsing, track selection, chapter parsing, URL parsing, formatting, prompt assembly, stream parsing, model resolution, and the Markdown renderer's escaping. `fetchEpisode` is a thin network adapter over a third-party API that changes without notice, so it is verified by running it rather than by fixtures that would give false confidence.

`extension/js/` is generated from `src/`, and `extension/skill/SKILL.md` is copied from `skills/`; both are committed, so the extension can be loaded without a build step. Rebuild with `npm run build` after editing `src/` **or the skill** — the extension runs the copy, not the original.

The icons in `extension/icons/` are PNGs rendered from two SVGs — `icon-small.svg`, drawn on the pixel grid, for 16 and 32px; `icon.svg` for 48 and 128px — and are committed too. After editing an SVG, re-render them with any Chrome: `CHROME=$(which google-chrome) node scripts/render-icons.mjs`.

## Docs

- [CONTEXT.md](./CONTEXT.md) — glossary
- [docs/adr/](./docs/adr/) — decisions: [0004](./docs/adr/0004-the-extension-evaluates-through-sippulse-ai.md), why the extension now evaluates; [0005](./docs/adr/0005-the-skill-file-is-the-prompt.md), why the rules file itself is the prompt; [0006](./docs/adr/0006-a-side-panel-not-a-popup.md), why a side panel; and [0001](./docs/adr/0001-browser-extension-because-sabr-killed-server-side-captions.md), kept as a record of a wrong turn
- [docs/spec/](./docs/spec/) — the original spec, now largely overtaken

## License

[MIT](./LICENSE)
