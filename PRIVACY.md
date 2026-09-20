# Privacy policy — Signal / Noise

Last updated: 20 September 2026

Signal / Noise is a Chrome extension that tells you whether a YouTube video is worth your time. This page says exactly what it reads, what it sends, to whom, and what it keeps. It is short because the extension does little.

## The short version

- The extension does nothing until you click one of its buttons.
- When you click **Evaluate this video**, the transcript of the video you have open is sent to SipPulse AI, with your SipPulse AI key, to produce the summary. That is the only thing that ever leaves your browser.
- Nothing is sent to the extension's author. There is no server of ours, no analytics, no tracking, and no advertising.

## What the extension reads

Only the YouTube video page in the tab you are looking at, and only when you click **Evaluate this video** or **Copy transcript**. It reads what that page already shows or links to:

- the video's title, channel, publication date, length, description and list of available captions;
- the transcript, which it gets by opening YouTube's own **Show transcript** panel and reading it.

It does not read any other tab, any other website, your browsing history, your YouTube account, or anything you type.

## What leaves your browser, and where it goes

**To SipPulse AI (`api.sippulse.ai`), when you click Evaluate this video:**

- the transcript of that one video, with its title, channel, publication date, length, link and chapter list;
- the instructions the extension gives the AI, and the mode and output language you selected;
- your SipPulse AI key, which identifies your SipPulse AI account so the request can be processed and billed to it.

When you save your key, and again at the start of each evaluation, the extension also asks SipPulse AI which AI models your key may use. That request carries your key and nothing about any video.

SipPulse AI processes this data to generate the summary, under its own terms and privacy policy, available at [sippulse.ai](https://sippulse.ai). The extension's author is affiliated with SipPulse, the company that operates SipPulse AI.

**To YouTube (`www.youtube.com`):** the same requests your browser makes when you open a video page and its transcript. The extension sends YouTube nothing about you that YouTube would not otherwise receive.

**To no one else.** **Copy transcript** and **Copy summary** put text on your own clipboard and send nothing anywhere.

## What is stored, and where

In your browser's local extension storage, on this device only — never synced to your Google account:

- your SipPulse AI key;
- your two preferences: Complete or Fast, and the output language.

The transcript and the summary are held in memory while the side panel is open and are discarded when you close it or evaluate another video. The extension keeps no history of the videos you evaluate.

To delete everything: click **Remove key** in the panel's Settings, or remove the extension from Chrome, which erases its storage.

## What is never collected

No personal information, no health, financial, location or authentication data other than the key you provide, no browsing history, no usage statistics, no identifiers. Nothing is sold or shared with anyone, for any purpose.

## Limited use

The use of information received by this extension adheres to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), including the Limited Use requirements. Data is used only to provide the single feature described above: evaluating the video you asked it to evaluate.

## Changes

If this policy changes, the new version will be published at this address with a new date, and material changes will be noted in the extension's release notes.

## Contact

Questions or concerns: open an issue at [github.com/flaviogoncalves/signal-noise/issues](https://github.com/flaviogoncalves/signal-noise/issues).

The extension's source code is public at [github.com/flaviogoncalves/signal-noise](https://github.com/flaviogoncalves/signal-noise), so every statement above can be checked.
