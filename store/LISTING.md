# Chrome Web Store listing — Signal / Noise

Everything to paste into the [Developer Dashboard](https://chrome.google.com/webstore/devconsole), in the order the dashboard asks for it. Images are in this folder; the package is built with `npm run package`.

## Before you start

- [ ] A Chrome Web Store developer account (one-time US$5 registration fee).
- [ ] `npm run package` → upload `dist/signal-noise-<version>.zip`.
- [ ] A **test key for the reviewer**: create a separate SipPulse AI key with a small amount of credit, used for nothing else, and delete it after the review. Without it the reviewer cannot see the extension work, which is a common reason for rejection. It goes in the dashboard only — **never commit it here**.

## Store listing tab

**Name** (comes from the manifest): `Signal / Noise`

**Summary** (comes from the manifest, 117 of 132 characters):
`Tells you whether a YouTube video is worth your time: what is new in it, what it changes, and which chapters to skip.`

**Category:** Productivity → Tools

**Language:** English

**Detailed description:**

```
Is this video worth your time — and if not, which 90 seconds are?

Signal / Noise answers that next to the video. Open any YouTube™ video, click one button, and a side panel gives you:

• A VERDICT — watch it all, skim these chapters, or "the summary below is the whole thing". A decision, not a hedge.
• WHAT IS NEW, AND WHAT IT CHANGES — the facts a viewer could not already have known, and who they matter to. When nothing in the video is new, it says exactly that.
• A SKIP LIST — every chapter that carries no new fact, named, so you can skip it with a clear conscience.
• CLICKABLE TIMESTAMPS — every claim is anchored to its chapter. Click one and the video jumps there, so checking a claim costs one click instead of a rewatch.

It is not a generic summarizer. A generic summary gets shorter by cutting content. Signal / Noise gets shorter by cutting repetition, preamble, opinion and forecasting, and keeping every number, name, date, condition and caveat that carries weight. Opinion is treated as noise until it is earned by data. Nothing quantitative is ever rounded away, and no timestamp is ever invented.

TWO MODES
• Complete — the full evaluation: verdict, what is new, signal, skip list, numbers, tensions.
• Fast — only the essential, for when you are in a hurry. Fast reports less; it does not read less. Both judge the whole video by the same rules.

IN YOUR LANGUAGE
The summary comes in your browser's language, or any language you pick, whatever language the video is in. Chapter titles and quotes stay in the original so they still match what YouTube shows you.

WHAT YOU NEED
A SipPulse AI key. It is the only setup there is. Creating an account at sippulse.ai is free and comes with a US$5 credit — enough to evaluate a good number of videos before you pay anything. After that, each evaluation is billed to your SipPulse AI account by the amount of text processed; the extension itself is free.

The video needs captions (most do, including auto-generated ones). Signal / Noise reads the transcript YouTube already has; it never records or transcribes audio.

PRIVACY
• Nothing happens until you click a button.
• When you click Evaluate, the transcript of that one video is sent to SipPulse AI, with your key, to produce the summary. Nothing else ever leaves your browser.
• Your key is stored in this browser only, never synced, and one click removes it.
• No analytics, no tracking, no ads, no server other than SipPulse AI itself.
The full policy and the complete source code are public: github.com/sippulse/signal-noise

Signal / Noise is an independent project and is not affiliated with, endorsed by, or sponsored by YouTube or Google. YouTube is a trademark of Google LLC.
```

**Graphic assets** (all in this folder):

| Dashboard field | File |
|---|---|
| Store icon (128×128) | `store-icon-128.png` |
| Screenshots (1280×800), in this order | `screenshot-1-verdict.png`, `screenshot-2-skip-list.png`, `screenshot-3-timestamps.png`, `screenshot-4-fast-and-language.png`, `screenshot-5-one-key.png` |
| Small promo tile (440×280) | `promo-small-440x280.png` |
| Marquee promo tile (1400×560) | `promo-marquee-1400x560.png` |

**Homepage URL:** `https://github.com/sippulse/signal-noise`

**Support URL:** `https://github.com/sippulse/signal-noise/issues`

## Privacy practices tab

**Single purpose:**

```
Signal / Noise has one purpose: to evaluate the YouTube video the user has open and show, in a side panel, whether it is worth watching — a verdict, what is new in it, and which chapters to skip. Everything the extension does (reading the video's transcript, sending it for analysis, showing the result, jumping to a timestamp) serves that one evaluation.
```

**Permission justifications:**

`sidePanel`
```
The extension's entire interface is a side panel shown next to the video. A side panel is used instead of a popup because an evaluation streams for several seconds, and a popup would close — cancelling the request — as soon as the user clicked back on the video.
```

`scripting`
```
Used only on the YouTube tab the user is viewing, and only after the user clicks "Evaluate this video" or "Copy transcript". It runs a small function in that page to (1) read the video's own page data (title, length, description, caption list), (2) open YouTube's built-in "Show transcript" panel and read the transcript it displays, and (3) move the video player to a timestamp when the user clicks one in the summary. No script is injected into any other site, and no remotely hosted code is ever executed.
```

`storage`
```
Stores three values locally on the user's device (chrome.storage.local, never synced): the user's SipPulse AI API key, and two preferences — summary mode (Complete or Fast) and output language. A "Remove key" button deletes the key.
```

`clipboardWrite`
```
The "Copy transcript" and "Copy summary" buttons place text on the user's clipboard at the user's request. The copy happens after the transcript has been fetched, which can take a few seconds after the click, so the permission is needed for the write to succeed reliably. The extension never reads the clipboard.
```

**Host permission justification** (the dashboard has one field for all hosts)
```
The extension needs two hosts, and uses each for one thing.

https://www.youtube.com/* — The extension works only on YouTube video pages. When the user clicks "Evaluate this video" or "Copy transcript", it reads the details of the video open in that tab (title, length, description, caption list), opens YouTube's built-in "Show transcript" panel and reads the transcript it displays, and moves the player to a timestamp the user clicks in the summary. Nothing is read until the user clicks a button in the panel.

https://api.sippulse.ai/* — This is the AI service that produces the evaluation. When the user clicks "Evaluate this video", the extension sends that one video's transcript to this API, authenticated with the API key the user entered, and receives the summary. It is the only external service the extension contacts. No other host is accessed.
```

**Are you using remote code?** No. All code is in the package; the text returned by the AI service is displayed as escaped text and is never executed.

**Data usage — what user data do you collect?** Tick only:

- [x] **Website content** — the transcript and details of the YouTube video the user chooses to evaluate, sent to SipPulse AI to generate the summary.
- [x] **Authentication information** — the SipPulse AI API key the user enters, stored locally and sent only to SipPulse AI to authorize the request.

Leave unticked: personally identifiable information, health, financial and payment, personal communications, location, web history, user activity.

**Certify all three:**

- [x] I do not sell or transfer user data to third parties, outside of the approved use cases.
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** `https://github.com/sippulse/signal-noise/blob/main/PRIVACY.md`

## Test instructions tab

Paste this, replacing the placeholder with the reviewer key **in the dashboard only**:

```
This extension needs a SipPulse AI API key to work. A key for review is provided below.

1. Pin the extension and click its icon. A side panel opens with "Settings" already expanded.
2. Paste this key into the "SipPulse AI key" field and click "Save key":
   <PASTE THE REVIEWER KEY HERE>
   The panel confirms with "Key saved."
3. Open any YouTube video that has captions, for example:
   https://www.youtube.com/watch?v=arj7oStGLkU
4. Click "Evaluate this video". YouTube's own transcript panel opens briefly on the page and closes again (that is the extension reading the transcript), then the evaluation streams into the side panel within a few seconds.
5. Click any blue timestamp in the summary: the video jumps to that moment.
6. Optional: switch to "Fast", or pick another output language, and click "Evaluate this video" again. "Copy transcript" and "Copy summary" copy text to the clipboard.

Without a key, clicking "Evaluate this video" shows "Add your SipPulse AI key first." — that is expected.
```

## Distribution tab

- **Payments:** Free of charge. (Usage is billed by SipPulse AI to the user's own account, as the description says.)
- **Visibility:** Public.
- **Regions:** All regions.

## After you submit

Review usually takes a few days, longer for a first submission or when host permissions are requested. If it is rejected, the email names the policy; bring it here and the fix is usually small. Do not resubmit unchanged.
