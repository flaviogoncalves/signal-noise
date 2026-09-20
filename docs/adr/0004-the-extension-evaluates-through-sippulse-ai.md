# The extension evaluates, through SipPulse AI

Amends [ADR 0003](./0003-android-client-to-reach-caption-tracks.md): its consequence "the tool is a CLI first; the extension is a convenience wrapper" no longer holds. The extension is now the product; the CLI is the headless half of it.

The extension no longer stops at the clipboard. It harvests the transcript, applies the `signal-noise` skill to it with DeepSeek 4.1 Flash on SipPulse AI, and shows the verdict next to the video. The only thing the user configures is a SipPulse AI key.

This reverses a line the README used to draw — "Summarise, in the extension: deliberately does not" — so the reason is recorded here.

The separation was protecting the wrong thing. It kept the two halves independently reusable, and they still are: the skill is an ordinary skill file, the CLI still prints transcripts, and **Copy transcript** is still one click. What the separation cost was the product. The question the project answers is "is this video worth my time", and answering it took a copy, a tab switch, a paste, and a subscription to a chat product. Nobody does that for a video they are merely curious about, which is most videos.

**One provider, one model, and it is that model or nothing.** The model id is not hardcoded, because the catalog is per-organization: the extension lists the models the key can use and finds DeepSeek 4.1 Flash among them. If it is not there, the extension refuses and says which models it did see. It never falls back to another model, not even a newer Flash — a summary's quality is attributable only if the model that wrote it is the one named. The model is resolved again on every evaluation, so a renamed id heals itself instead of failing with an error that never says "save your key again".

## Consequences

The extension now talks to a second host, `api.sippulse.ai`, and sends it the transcript of each video the user evaluates. The key lives in `chrome.storage.local` — this browser only, never synced — until the user removes it. Nothing is sent anywhere until the user clicks Evaluate, and Copy transcript still touches nothing but YouTube.

The extension now renders text written by a model over a stranger's transcript, so that text is hostile until rendered safe. `renderMarkdown` escapes everything before adding markup, and the only attribute whose value comes from the model is an `href`, which must be `http(s)`.

[ADR 0002](./0002-harvest-only-never-transcribe.md) is untouched. The extension still never transcribes; an Uncaptioned Episode is refused before any model is called.

How the skill reaches the model is [ADR 0005](./0005-the-skill-file-is-the-prompt.md); why the interface is a side panel is [ADR 0006](./0006-a-side-panel-not-a-popup.md).

Not built, on purpose: choosing a provider or model, chunking transcripts longer than the model's context (the API's own refusal is shown as-is), and caching summaries between sessions. Each is worth adding when someone actually hits it.
