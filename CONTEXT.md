# Context

Glossary for `yttranscribe` and the Signal / Noise extension. Terms only — no implementation detail.

## Podcast

A **YouTube video** treated as a long-form spoken-word episode. Despite the everyday meaning, in this project "podcast" never refers to Spotify, Apple Podcasts, or a standalone RSS audio feed — those are permanently out of scope.

## Harvest

To obtain a transcript that **already exists**, by reading it out of the page. No audio is processed and nothing is inferred. Contrast with [[Transcribe]].

## Transcribe

To **create** a transcript that does not exist, by running speech-to-text over captured audio.

**This project never transcribes.** It only harvests. An episode with no captions is an [[Uncaptioned Episode]] and is refused. Despite the project name, no audio is ever processed.

## Uncaptioned Episode

An episode for which every [[Transcript Source]] declined — YouTube has no caption track to harvest. This is a **refusal, not a failure**: the tool says plainly that the episode has no captions and stops. It never falls back to speech-to-text, and never emits a partial or reconstructed transcript.

## Blocked Track

A caption track that YouTube listed but then would not serve — it answers the download with a rate-limit page instead of captions. The episode is **not** an [[Uncaptioned Episode]]: the captions exist and the block is on the network, not the episode. This is a **failure, not a refusal**, and worth retrying.

## Transcript Source

A named strategy for obtaining a transcript for one episode. Each source either yields a transcript or declines, so they can be tried in order. Every transcript records which source produced it, so poor output can be attributed to the source.

## Evaluate

To apply the `signal-noise` skill to a harvested transcript and show the result. Evaluating is what the extension is for; harvesting is its first step. An [[Uncaptioned Episode]] is refused before anything is evaluated.

## Mode

How much an evaluation reports. **Complete** emits every block of the skill's format that applies. **Fast** emits only the essential — verdict, what is new, at most five lines of signal. The mode never changes how carefully the material is judged: both run the same tests over the whole transcript. Defined by the skill, not by the extension.

## Output Language

The language an evaluation is written in, chosen by the user and independent of the video's language. Always stated to the model explicitly; "browser language" is resolved to a named language before it is sent, never left for the model to infer.
