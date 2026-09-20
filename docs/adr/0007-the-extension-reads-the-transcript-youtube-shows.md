# The extension reads the transcript YouTube shows

Amends [ADR 0003](./0003-android-client-to-reach-caption-tracks.md): the Android client is now the CLI's Transcript Source only. The extension no longer uses it, and its code is not in the extension package.

In the extension, the transcript comes from YouTube's own transcript panel. The extension does what a viewer does — clicks **Show transcript**, picks the caption language in the panel's menu — and reads what YouTube renders. The video's title, length, description and caption list come from the watch page's own HTML. It asks YouTube for nothing the page would not ask for itself, and it claims to be nothing it is not.

The Android client works, and takes about a second. It is also a request that identifies itself as an app it is not, to get past a gate YouTube put on its web client. That is a fair trade for a command-line tool its user runs knowingly. It is the wrong thing to ship to the Chrome Web Store, whose reviewers — and YouTube — can remove an extension for it at any time, and it was the one part of the extension that could get the whole thing taken down.

## What was tried first

Measured on 2026-09-20, in the order they were ruled out:

- **The caption URLs the page lists.** Still the zero-byte responses ADR 0003 describes.
- **Calling `get_transcript` from the page with the page's own context.** `400 Precondition check failed`. Capturing YouTube's own request showed why: its body carries an attestation produced by YouTube's anti-abuse code. Replaying YouTube's body verbatim returns 200; the same request with the page's plain context returns 400; headers make no difference. Producing that attestation ourselves would be getting past a gate again, so this was dropped.
- **Letting YouTube make the request, and reading the result.** Works: YouTube attests its own request.

## What the panel is like

- It comes in two builds with different markup (`ytd-transcript-segment-renderer`, `transcript-segment-view-model`) and at least three panel ids, one of them absent. The panel is therefore recognised by what it contains, not by what it is called.
- Only the older build has a language menu. There, the extension applies the same preference as ever — human-written in the spoken language, then auto-generated — by clicking the menu item whose label is the wanted track's name. In the newer build YouTube's choice stands and cannot be read, so a video with more than one track is reported as "YouTube does not say which captions it showed" rather than guessed at.
- YouTube's own choice of language is not stable. The same video opened on auto-generated English, on human-written English, and on Arabic — the first of its fifty tracks alphabetically — in successive loads, and the Arabic load came up empty. Choosing the language explicitly is what makes the harvest repeatable. When the panel still comes up empty, the chosen language is clicked again, which makes YouTube request the transcript again; closing and reopening the panel does not. That one click is the whole retry policy.
- YouTube does not always state the spoken language, and the caption list alone cannot be trusted to reveal it: for a video YouTube has dubbed by machine it sometimes lists one auto-generated track per dub, the original not first. The audio track list settles it, because machine dubs carry ids ending in `.10` and the uploader's own audio does not. The auto-generated captions are believed only when they all agree. (This also fixed the CLI, which would have picked Arabic for a talk with fifty translated tracks.)

## Consequences

Harvesting takes three to four seconds instead of one, and briefly opens YouTube's transcript panel on the page; the extension closes it again unless the viewer already had it open.

The harvest now depends on YouTube's page markup, which changes without notice and differs between viewers. This is the fragility ADR 0001's harvester had, accepted knowingly this time and bounded: there is no playback, no scrolling, and the panel delivers the whole transcript at once. A transcript that stops well short of the video's length is reported as incomplete, never passed off as whole.

Every line now arrives with its timestamp, which the Android source never gave. Nothing uses that yet beyond the completeness check; the summary's anchors are still chapter-accurate. Anchoring claims to the second is now possible and is a separate decision.

Verified 2026-09-20 through the built extension in Chromium, five videos across both builds, in English and Portuguese interfaces: a 31-minute interview (5,898 words, captions to 1852s of 1860s), a 14-minute talk with fifty tracks (human-written English chosen), and three videos in the newer build.
