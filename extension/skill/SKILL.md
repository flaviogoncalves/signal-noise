---
name: signal-noise
description: High-fidelity compression of long material. Strips rhetorical noise while preserving every load-bearing fact, number, condition, obligation, and disagreement. Use this whenever the user asks to "summarize this", "extract the signal", "condense", "filter the noise", "TL;DR without losing content", or the Portuguese equivalents ("resumir", "resume isso", "filtra o ruído", "mantém o sinal", "condensa"), or hands over a long document, transcript, contract, proposal, paper, article, video, or thread and wants it shorter without losing substance. Also use when the user wants to compare two long documents, extract decisions from a meeting, or reduce something for later reference. Trigger even if the user does not say "skill" and even if the request sounds casual ("just give me the gist of this"). Do NOT use for news curation or daily briefings.
---

# Signal / Noise

Separate the signal from the noise in long material.

High-fidelity compression. The goal is not to write *less*, it is to write *without waste*.

## The principle

A bad summary gets shorter by cutting content. A good summary gets shorter by cutting **rhetorical redundancy** and keeping 100% of the content that carries weight.

Most of a long text is scaffolding: transitions, restatements of the same idea, examples that only illustrate something already asserted, hedging, self-reference ("as we will see below"), pleasantries, preamble. All of that goes. What stays is what changes someone's decision.

Practical test to apply to every sentence before cutting it: **if I delete this, would anyone make a different decision, or lose the ability to verify a claim?** If yes, it stays.

## The primary path: video and podcast transcripts

This skill exists mainly to answer one question fast: **is this video worth the user's time, and if so, which minutes of it?** Everything else it handles is secondary.

Expected input shape, as produced by ytranscribe:

```
# Title
**Channel:** ...
**Duration:** 34m
**URL:** https://...
## Chapters
- 0:00 — Intro
- 10:29 — Startup Idea 1
## Transcript
[flat body, no inline timestamps]
```

Three rules follow from that shape:

**Anchor every load-bearing claim to a chapter.** The transcript body runs in chapter order, so any claim can be placed in the chapter it falls under. Write the anchor as the chapter timestamp and title, for example `(10:29 Startup Idea 1)`. This is what turns a summary into a navigation tool: the user jumps to the 90 seconds that matter and skips the rest.

**Never invent a timestamp.** ytranscribe carries no inline time markers, so precise `mm:ss` for a specific sentence cannot be derived, only guessed. Chapter granularity is the floor. If the video has no chapter list, ship the summary with no anchors and say so in one line. A fabricated timestamp destroys the only thing that makes this output trustworthy.

**Attribute by chapter title, not by position in the body.** The body is flat prose: there is no marker saying where one chapter ends and the next begins, so "which chapter is this passage in" is a judgement, not a measurement. Estimating it from how far down the text sits is guessing dressed as precision. Instead, match the claim to the chapter **title that names it** — titles are the one piece of ground truth the input gives you. Two consequences: when a passage sits between two chapters and one title names its subject, anchor there regardless of position; when a long passage builds to a claim, anchor it to the chapter whose title states the claim, not where the setup began. If no title names the subject and the passage is genuinely spread across two chapters, cite both (`22:36 → 25:17`) rather than picking one and looking exact. If nothing fits, drop the anchor for that line — an unanchored true line beats a confidently misplaced one.

**Turn anchors into links when the header carries a URL.** The point is not navigation, it is verification: when a claim is important enough that the user wants to check it before acting on it, the cost of checking should be one click, not rewatching. Convert the chapter timestamp to seconds and append it. `10:29` becomes `t=629s`. Use `&t=` when the URL already has a parameter (`youtube.com/watch?v=ID`) and `?t=` when it does not (`youtu.be/ID`). No URL in the header means no links, and that is fine. The link inherits the precision of the anchor, it does not create new precision: a link pointing at the wrong chapter is worse than no link, because it looks exact.

**Name the chapters that contain nothing.** Telling the user what to skip saves as much time as telling them what to read, and it is information they cannot get any other way.

Creator monologues, podcasts, and conference talks are optimized for retention, not density. Always cut: the opening hook, like-and-subscribe requests, self-reference to previous episodes, plugs for the author's own product, illustrative anecdotes, and the thesis repeated at the opening, the middle, and the close. Specific caution: numbered lists of ideas, tips, or steps are usually one idea reapplied to different niches. Compress to the shared mechanism and cite the niches in a single line, instead of treating each item as independent content.

### In video, opinion is noise until it is earned

This is the rule that separates a useful video summary from a transcript with fewer words. **The signal in a video is the fact: the central idea and what can be checked. Nearly everything else is the speaker performing.** A 30-minute interview typically contains two or three minutes of fact and 27 minutes of opinion, anecdote, career advice, and forecasting. A summary that reproduces that ratio has failed, even if every sentence in it is accurate.

Apply this test to every claim before it enters the summary: **could this be false, and could someone check?** A number, a date, a mechanism, a thing that happened, a decision someone made — checkable, so it is signal. A prediction, a preference, a vibe, a piece of life advice, a "I think the fear is overstated" — not checkable, so it is opinion.

Opinion earns a place **only** when one of these holds:

- **It rests on data the speaker uniquely has.** A payments CEO saying "new business signups are up 2x on our platform" is fact wearing an opinion's clothes. Keep it, and keep it attached to the data.
- **The speaker is the reason the claim matters** — a founder describing why they made a decision inside their own company, an author explaining their own method. Their opinion about their own conduct is evidence about that conduct.
- **The material is nothing but opinion**, in which case say so in the first line and compress the position itself rather than pretending facts exist.

Everything else goes: forecasts about the industry, takes on whether to attend college, motivational closings, "it's never been a better time" framings, and reassurance that the audience will be fine. These feel like content because they are what the speaker said most. They are what the format rewards, not what the viewer needs.

**Never launder opinion into fact.** Cutting an opinion is correct; restating it without its hedge is lying. If a kept opinion was hedged ("probably", "hard to predict"), the hedge survives with it — see the preservation list. The choice is keep-with-hedge or cut, never keep-and-harden.

For video, `## Thesis` therefore holds the **factual centre** of the material — what it establishes — not the speaker's worldview. When the speaker's interpretation is worth recording at all, it goes in one line inside `## Signal`, explicitly attributed ("Collison's read, no data offered:"), never as a headline block. A summary whose most prominent claim is something nobody can check has inverted the hierarchy.

### New and relevant are two separate gates

Checkability decides whether a claim is a fact. Two further gates decide whether that fact is worth the reader's attention, and **a claim must pass both**. This is the heart of the skill: the reader is not asking "what was said", they are asking **what is new, and why does it matter to me**.

**Gate 1 — is it new?** Judge against a reader who follows this subject but has not seen this specific item. Not new: background any practitioner has, the definition of a term, a well-known event recounted, a statistic that has circulated for a year. New: a number released here, a mechanism explained for the first time, a decision or launch being disclosed, a figure only this speaker has access to.

Beware the format's favourite move: presenting the long-known as revelation. Framing something as surprising does not make it new. Ask when the reader could first have known this — if the answer is "years ago", it is background, and background belongs in a subordinate clause or nowhere.

**Gate 2 — is it relevant?** Relevance is consequence: something changes because this is true. A fact with no consequence is trivia, however new and however verified. The test is to try to write the "so what" clause — if you cannot finish *"which means…"* without inventing something the source does not support, the fact does not clear the gate.

Do not judge this against one reader's interests. You do not know who is reading, and guessing produces a summary that is wrong for everyone else. Judge it generally, and make the summary self-selecting instead: **name who is affected and what changes for them.** "Stripe's signup data is up 2x — which means founders raising on 'the market is frozen' are arguing against the payment rails' own numbers" tells every reader in one line whether this concerns them. "Interesting data on startup formation" tells nobody anything.

Two rules keep this honest. Take the consequence from the material wherever the material states one, and never manufacture a consequence the source does not claim — an invented "so what" is the most damaging thing this skill could produce, because it reads as analysis. And where the source states a consequence for a narrow group, say which group rather than inflating it into a general claim.

If the user has stated a context of their own, that is an additional filter to apply on top — never a replacement for the general test.

**What each combination means:**

- **New and relevant** — this is the summary. It goes in `## What is new`, first.
- **Relevant but not new** — the reader already knows it. Compress hard or cut; never lead with it.
- **New but not relevant** — trivia. Cut, unless the whole material is trivia, in which case say that.
- **Neither** — noise, by definition.

**Say so when nothing is new.** A great deal of material contains no new fact and is a competent re-arrangement of known ones. Reporting that plainly — "nothing here is new; it restates X and Y, well" — is one of the most valuable outputs this skill produces, because it returns the reader's time immediately. It is a finding, not a failure, and it must never be padded into looking like a discovery.

## Step 1: Classify the source before compressing

What counts as "signal" changes with the type of material. For video and podcast, use the primary path above. For everything else, identify the type and read the matching section in `references/source-types.md` before writing:

| Type | What the signal is |
|---|---|
| Video / podcast / talk | What is factually new, where it sits in the timeline, what to skip |
| Meeting or call transcript | Decisions, owners, deadlines, unresolved disagreements |
| Contract / legal | Obligations, triggers, exceptions, deadlines, penalties |
| Technical paper | Method, numbers, experimental conditions, limitations |
| Commercial proposal | Price, scope, assumptions, what is excluded |
| Article / post (written) | The thesis, the argument supporting it, what contradicts it |
| Technical documentation | Behavior, parameters, error cases |
| Thread / discussion | The distinct positions and what each one defends |

If the material is mixed or the type is not obvious, compress by the dominant type and say so in one line.

## Step 2: The mandatory preservation list

This is **never** cut, summarized, or rounded. It is the difference between a summary and a useless paraphrase:

- **Numbers with their unit and their context.** "$29.90/month per active subscriber", not "low price". Percentages, deadlines, volumes, thresholds, rates.
- **Proper nouns.** People, companies, products, versions, protocols, statute sections.
- **Dates and deadlines**, including relative ones ("90 days after signature").
- **Conditionals and exceptions.** "unless", "provided that", "except when". These are exactly what lazy summaries erase, and they are where the risk lives.
- **Who committed to what.** Obligations, task owners, responsibilities.
- **Disagreement and caveats.** If someone objected, if the author admitted a limitation, if there is a counter-argument in the text, it stays. A summary that turns debate into consensus is lying.
- **Stated causality.** "X because Y". The "because" is the content.
- **The author's own uncertainty.** If the source says "probably" or "we estimate", do not convert it into a categorical claim. Preserve the original confidence level.

## Step 3: The noise taxonomy

This always goes:

- Preamble, acknowledgments, introductions of participants with no content
- Transitions and paragraph connectives
- The same idea restated in different words
- Examples that only illustrate an already stated point (keep the example only when it **is** the argument, or when it is the only way to make the point verifiable)
- Structural self-reference ("in this chapter", "we will return to this")
- Empty hedging that does not change the confidence level ("it is important to note that")
- Marketing and adjectives with no verifiable content ("robust and innovative solution")
- In transcripts: disfluencies, small talk, audio problems, speech echo repetition
- In video and podcast specifically: unbacked forecasts, general life and career advice, reassurance, host-guest mutual flattery, origin-story anecdotes, and any opinion that fails the checkability test above

## Step 4: Choose the compression level

The default is **high fidelity**, not maximum brevity. If the user does not specify, use Level 2.

- **Level 1, Extract (~40% of the original).** Almost nothing is lost. For contracts, papers, and material that will be used as an actual reference.
- **Level 2, Condensed (~20%).** Default. All the signal, zero scaffolding.
- **Level 3, Core (~5%).** Only what changes a decision. Use when explicitly asked ("keep it short", "just the essentials").

When compressing beyond Level 2, say what was left out so the user knows more exists.

### Mode: Complete or Fast

The mode decides **how much is reported**, never how carefully it is judged. Both modes run the same tests — checkability, the two gates, the preservation list — over the whole material. Fast is not a skim of the first ten minutes.

- **Complete.** Default. Every block of the Step 5 format that applies, at the chosen compression level.
- **Fast.** Only the essential: what the reader needs to decide, and nothing to browse. Use when the request says so ("fast", "quick", "just the essentials", "rápido", "só o essencial") or when the caller sets `Mode: Fast`.

Fast always compresses at Level 3 and emits only these blocks, in this order:

1. The header line.
2. `## Verdict` — unchanged. When the call is "skim chapters X and Y", name them here with their anchors, because Fast has no skip list to carry them.
3. `## What is new — and what it changes` — unchanged. This block is never shortened to fit a mode; it is the reason the summary exists.
4. `## Signal` — at most five bullets, the five that would change a decision, each anchored as usual. If fewer than five clear the gates, write fewer. Never pad to five.
5. `## Cut` — one line, which in Fast also names what Complete would add ("Complete adds: skip list, two tensions, a table of thresholds"), so the reader knows whether asking for more is worth it.

Fast omits `## Thesis`, `## Skip list`, `## Numbers and commitments`, `## Tensions and gaps`, and `## Verified addition`. One exception: a disagreement or caveat that reverses the meaning of a kept claim is not a "tension" to be dropped — it travels with that claim, in the same bullet. The preservation list outranks the mode.

If nothing clears both gates, Fast and Complete produce the same output: the one-line finding, and stop.

## Step 5: Output format

Use this structure in Complete mode, adapting the blocks that do not apply (empty blocks should be omitted, not filled with "N/A"). Fast mode uses the subset named in Step 4:

```markdown
**[Source type] | [original length -> summary length]**

## Verdict
[Video and podcast only, and always first. One of three calls, stated plainly:
"worth watching in full", "skim chapters X and Y, skip the rest", or "the summary
below is the whole thing". Add the trade: original duration versus read time.
This is the block the user came for. Do not hedge it.

Decide it on how much clears both gates — new AND relevant — not on how interesting
the talk was. If everything that clears them fits in the summary, the call is "the
summary below is the whole thing", which is the honest verdict for most videos and
the one to reach for by default. If nothing clears them, say so outright: "nothing
new here" is a complete and valuable verdict. "Worth watching in full" requires a
reason the transcript cannot carry — a demo, a document shown on screen, tone that
changes the meaning — and is never awarded for a talk that was merely well delivered.]

## What is new — and what it changes
[THE most important block. Compose it before anything else, and cut everything
that does not survive next to it. Two to four sentences, carrying two things:

  1. The new, checkable fact — who did what, by what mechanism, with the numbers.
  2. The consequence — who is affected and what changes for them. State it
     generally so any reader can tell whether it concerns them. Take it from the
     material; never invent one.

Both gates must be passed: new AND relevant. Old-but-relevant is background and
belongs lower. New-but-inconsequential is trivia and gets cut.

If nothing clears both gates, say exactly that in one line — "nothing here is new;
it restates X and Y" — and stop. That is a finding and it is often the most useful
output this skill produces. Do not pad it into looking like a discovery.

Omit this block only for operational material (contract, proposal, minutes,
report), where "What this is" already covers it.]

## Thesis
[1-3 sentences. What this material claims, at bottom. For an operational rather
than argumentative document, replace with "What this is". In opinion material,
this block is the author's interpretation and must be marked as such, kept
separate from the block above.

For video and podcast: this block carries the factual centre — what the material
establishes that can be checked — NOT the speaker's worldview. The speaker's
interpretation, if kept at all, is one attributed line inside Signal. If the video
establishes no checkable fact, write that plainly here and let the summary be short;
that is a finding, not a failure.]

## Signal
[The body. Dense prose or bullets, whichever fits the material. Every line
carries a fact, a number, a condition, or a commitment. No connective sentences.
For video, anchor each claim to its chapter: (10:29 Startup Idea 1).]

## Skip list
[Video and podcast only. Timestamp, title, three words on why. Binary test: cite
one fact from a chapter and it cannot be listed here. Omit when every chapter earns
its place.]

## Numbers and commitments
[Only for what is NOT already in the body — this is an index for recovery, not a
second pass. Legitimate uses: a series or set of thresholds worth seeing side by
side, and commitments with an owner or deadline. If every number already sits in
the body with its context, omit the block.]

## Tensions and gaps
[Unresolved disagreements, admitted limitations, claims without evidence,
internal contradictions, what the material should answer and does not.]

## Verified addition
[Only when the source names a protocol, standard, product, or technology without
explaining what it does, and that explanation is what makes the claim operative.
Verify externally, record it with the source, cap of 3 items. Stays outside the
body. If verification contradicts the source, record the contradiction, do not
silently correct the source.]

## Cut
[One line saying what was discarded, by category. Levels 2 and 3 only.]
```

**The first-sentence test.** Before delivering, reread the opening sentence. If it describes a trend and can be written without a single proper noun, number, or mechanism, it is rhetorical framing and not signal. Rewrite it.

- Bad: "the internet is shifting from pages humans visit to resources agents use".
- Good: "Cloudflare now allows charging per request for pages, APIs, datasets, and MCP tool calls, with the price declared via HTTP 402 and settlement in stablecoins".

The exception is genuine absence: if the meeting decided nothing, or the material asserts nothing verifiable, the first sentence says that, and that is signal.

**Language:** never the source's language by default. Resolve it in this order:

1. **An explicit request wins over everything**, including the language the request itself is written in. "Summarize this in Portuguese" typed in English produces Portuguese; "resume isso em inglês" produces English. Do not second-guess it.
2. **Otherwise, match the language of the request.** A prompt written in Portuguese gets a Portuguese summary of an English video.
3. **If the request is a bare path, a URL, or a slash command with no prose to read**, use the language the user has been speaking in this conversation. Only when there is nothing to go on, use the source's language and say so in one line.

A follow-up in another language ("agora em inglês") re-runs the output in that language; it does not re-open the compression decisions.

**What never gets translated, regardless of output language:**

- Technical terms, product names, company names, protocols, statute and clause numbers, parameter and flag names.
- Direct quotes. Translating a quote makes it a paraphrase while it still wears quotation marks. Quote in the original; add a translation after it only when the wording is the point.
- **Chapter titles in video anchors.** The anchor exists so the user can match it against what YouTube shows them. A translated title breaks that match and makes a correct link look wrong: keep `(9:58 Why Stripe Worked)` verbatim even in a Portuguese summary. The prose around it is translated; the title inside the anchor is not.

Section headings ARE translated (`## Verdict` becomes `## Veredito`) — they are prose, not identifiers.

## Failure modes to avoid

These are the errors that make a summary look good and be useless:

1. **Flattening the specific into the generic.** "They discussed pricing" instead of "they set $49.90 for the mid tier". The specific *is* the summary.
2. **Manufacturing coherence.** Long texts contain contradictions. If the source contradicts itself, record the contradiction instead of silently picking a side.
3. **Inheriting the source's structure.** The original's order serves the original. Reorder by importance, not by sequence, except when the sequence is the content (procedure, chronology, causal chain).
4. **Filling gaps with your own knowledge.** If the source does not say it, the summary does not say it. The single exception is a term the source names but never defines, which goes to `## Verified addition` with the source of the verification. The rule forbids inventing, it does not forbid verifying: a term mentioned in passing can be denser than the rest of the material combined.
5. **Neutralizing the force of a claim.** If the author was categorical, the summary is categorical. If the author was cautious, the summary is cautious.
6. **Mistaking volume for importance.** Twenty minutes on a trivial point and one sentence deciding the budget: the sentence is worth more.
7. **Inheriting the author's rhetorical framing.** In talks, posts, and monologues, the thesis is usually a frame repeated for retention, while the mechanism appears once, in the middle. Repetition is not emphasis, it is format. Actively look for the paragraph with proper nouns and numbers that appears only once: it is almost always the summary. A summary that opens with the frame and buries the mechanism has inverted the hierarchy.

## When the material did not arrive

If the user asks for a summary without attaching anything, actually look for it before answering — list the upload directory, the path they named, or the working directory, whichever applies to the environment you are running in — and say the content did not arrive instead of summarizing whatever happens to be in context by mistake. Never summarize from memory of a video you were not given: recognizing the title is not having watched it.

## When the material is too long for one pass

Compress in blocks, in order, then do a consolidation pass over the partial summaries, removing repetition across blocks and reordering by importance. Do not deliver the partials concatenated: that reintroduces exactly the noise this skill exists to remove.
