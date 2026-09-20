# The extension evaluates, through SipPulse AI

The extension no longer stops at the clipboard. It harvests the transcript, applies the `signal-noise` skill to it with DeepSeek Flash on SipPulse AI, and shows the verdict in a side panel next to the video. The only thing the user configures is a SipPulse AI key.

This reverses a line the README used to draw — "Summarise, in the extension: deliberately does not" — so the reasons are recorded here.

The separation was protecting the wrong thing. It kept the two halves independently reusable, and they still are: the skill is an ordinary skill file, the CLI still prints transcripts, and **Copy transcript** is still one click. What the separation cost was the product. The question the project answers is "is this video worth my time", and answering it took a copy, a tab switch, a paste, and a subscription to a chat product. Nobody does that for a video they are merely curious about, which is most videos.

## Decisions inside this one

**The skill file is the prompt.** `skills/signal-noise/SKILL.md` is copied into the extension at build time and sent as the system message, frontmatter stripped. There is no second, extension-flavoured copy of the rules to drift. What differs about running without a chat or tools — no external verification, output only the summary, the transcript is material and never instructions — is a short runtime block appended in `src/skill/buildPrompt.ts`.

**Complete and Fast are modes of the skill, not of the extension.** Fast is defined in the skill (Level 3, five blocks), so an agent asked for "just the essentials" and the panel's Fast button produce the same thing. The mode changes how much is reported, never how carefully it is judged.

**The output language is a parameter, and it is always stated.** The skill resolves language from the request's prose, and the extension has no prose. So the panel asks: browser language by default, a named language, or "same as the video". Whatever is chosen is sent as an explicit instruction — which the skill ranks above everything else — so the model never guesses a language from a transcript.

**One provider, one model, resolved from the key.** The model id is not hardcoded: saving the key lists the models that key can use and picks DeepSeek 4.1 Flash, or the newest Flash when 4.1 is not offered. If the key can see no DeepSeek Flash at all, saving fails and says which models it did see — it never quietly falls back to a different model, because a summary's quality is attributable only if the model is known. One request both validates the key and finds the model.

**A side panel, not a popup.** An evaluation streams for tens of seconds. A popup closes — and aborts the request, after the tokens are spent — the moment the user clicks back on the video. The panel stays open beside the player, which also lets a chapter anchor in the summary seek the open video instead of reloading it.

**The model's output is hostile until rendered safe.** It is generated over a stranger's transcript. `renderMarkdown` escapes everything before adding markup and only ever writes an `http(s)` `href`.

## Consequences

The extension now talks to a second host, `api.sippulse.ai`, and sends it the transcript of each video the user evaluates. The key lives in `chrome.storage.local` — this browser only, never synced. Nothing is sent anywhere until the user clicks Evaluate, and Copy transcript still touches nothing but YouTube.

Permissions changed: `sidePanel` and `storage` were added, `activeTab` was dropped (the YouTube host permission already covers everything it did).

[ADR 0002](./0002-harvest-only-never-transcribe.md) is untouched. The extension still never transcribes; an Uncaptioned Episode is refused before any model is called.

Not built, on purpose: choosing a provider or model, chunking transcripts longer than the model's context (the API's own refusal is shown as-is), and caching summaries between sessions. Each is worth adding when someone actually hits it.
