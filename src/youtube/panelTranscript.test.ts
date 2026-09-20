import { describe, expect, it } from "vitest";
import { NoCaptionsError, NotPlayableError, TrackUnavailableError } from "./errors.js";
import {
  assertCaptioned,
  episodeFromPanel,
  identifyTrack,
  parseWatchHtml,
  stampToSeconds,
} from "./panelTranscript.js";
import { originalLanguageOf, type PlayerResponse } from "./playerResponse.js";
import { selectTrack, type CaptionTrack } from "./selectTrack.js";

const track = (languageCode: string, name: string, kind?: string): CaptionTrack => ({
  languageCode,
  baseUrl: "https://example.test/track",
  name: { simpleText: name },
  ...(kind ? { kind } : {}),
});

const video = (tracks: CaptionTrack[], extra: Partial<PlayerResponse["videoDetails"]> = {}): PlayerResponse => ({
  playabilityStatus: { status: "OK" },
  videoDetails: {
    title: "Is AI Breaking the Lean Startup Playbook?",
    author: "Y Combinator",
    lengthSeconds: "1860",
    shortDescription: "0:00 Intro\n25:17 Why now",
    ...extra,
  },
  microformat: { playerMicroformatRenderer: { publishDate: "2026-07-31T10:29:06-07:00" } },
  captions: { playerCaptionsTracklistRenderer: { captionTracks: tracks } },
});

const spoken = (...stamps: string[]) => ({ segments: stamps.map((stamp) => ({ stamp, text: `said at ${stamp}` })) });

describe("parseWatchHtml", () => {
  const page = (json: string) => `<script>var ytInitialPlayerResponse = ${json};var meta = 1;</script>`;

  it("reads the player response out of a watch page", () => {
    expect(parseWatchHtml(page('{"videoDetails":{"title":"T","author":"A"}}'))?.videoDetails?.title).toBe("T");
  });

  it("is not fooled by a description that contains the text that ends the object", () => {
    const tricky = '{"videoDetails":{"title":"T","author":"A","shortDescription":"code: if (x) {y};\\" };"}}';
    expect(parseWatchHtml(page(tricky))?.videoDetails?.shortDescription).toBe('code: if (x) {y};" };');
  });

  it("declines a page that does not describe a video", () => {
    expect(parseWatchHtml("<html>consent wall</html>")).toBeUndefined();
    expect(parseWatchHtml("var ytInitialPlayerResponse = {broken")).toBeUndefined();
  });
});

describe("stampToSeconds", () => {
  it("reads the timestamps the panel displays", () => {
    expect(stampToSeconds("0:07")).toBe(7);
    expect(stampToSeconds(" 25:17 ")).toBe(1517);
    expect(stampToSeconds("1:02:03")).toBe(3723);
  });

  it("declines what is not a timestamp", () => {
    expect(stampToSeconds("")).toBeUndefined();
    expect(stampToSeconds("7 seconds")).toBeUndefined();
  });
});

describe("identifyTrack", () => {
  const tracks = [track("en", "Inglês"), track("en", "Inglês (gerada automaticamente)", "asr"), track("pt-BR", "Português (Brasil)")];

  it("matches the panel's label to the track list, in whatever language the interface is in", () => {
    expect(identifyTrack(tracks, " Inglês (gerada automaticamente) ")?.kind).toBe("asr");
  });

  it("needs no label when the video has a single track", () => {
    expect(identifyTrack([tracks[2]!], undefined)?.languageCode).toBe("pt-BR");
  });

  it("answers unknown rather than guessing", () => {
    expect(identifyTrack(tracks, undefined)).toBeUndefined();
    expect(identifyTrack(tracks, "Klingon")).toBeUndefined();
  });
});

describe("originalLanguageOf", () => {
  const ted = [track("ar", "Arabic"), track("en", "English"), track("en", "English (auto-generated)", "asr"), track("pt-BR", "Portuguese (Brazil)")];

  it("believes YouTube when it says", () => {
    expect(originalLanguageOf(video(ted, { defaultAudioLanguage: "en-US" }))).toBe("en-US");
  });

  it("reads it off the auto-generated track when YouTube does not say", () => {
    expect(originalLanguageOf(video(ted))).toBe("en");
  });

  it("so a video with many translations is not mistaken for an Arabic one", () => {
    expect(selectTrack(ted, originalLanguageOf(video(ted)))?.track.name?.simpleText).toBe("English");
  });

  it("admits it does not know when nothing says", () => {
    expect(originalLanguageOf(video([track("ar", "Arabic"), track("en", "English")]))).toBeUndefined();
  });

  describe("on a video YouTube has dubbed by machine", () => {
    // What YouTube really served for one interview: an auto-generated track per dub, the original not first.
    const perDub = [track("de-DE", "German", "asr"), track("ar", "Arabic", "asr"), track("en", "English", "asr"), track("pt-BR", "Portuguese", "asr")];
    const dubbed = (tracks: CaptionTrack[]): PlayerResponse => {
      const payload = video(tracks);
      payload.captions!.playerCaptionsTracklistRenderer!.audioTracks = ["de-DE.10", "ar.10", "en-US.4", "pt-BR.10"].map((audioTrackId) => ({ audioTrackId }));
      return payload;
    };

    it("finds the one audio track that is not a dub", () => {
      expect(originalLanguageOf(dubbed(perDub))).toBe("en-US");
    });

    it("so the English captions of an English interview are not called a translation of German", () => {
      const result = episodeFromPanel(dubbed(perDub), { ...spoken("30:00"), trackLabel: "English" }, "x");
      expect(result.warning).toBeUndefined();
      expect(result.trackLanguage).toBe("en");
      expect(selectTrack(perDub, originalLanguageOf(dubbed(perDub)))?.track.languageCode).toBe("en");
    });

    it("does not take the first auto-generated track's word for it when they disagree", () => {
      expect(originalLanguageOf(video(perDub))).toBeUndefined();
    });
  });
});

describe("assertCaptioned", () => {
  it("refuses an Uncaptioned Episode before the page is touched", () => {
    expect(() => assertCaptioned(video([]), "5d6y3poKwK4")).toThrow(NoCaptionsError);
  });

  it("reports a video YouTube will not play as that, not as uncaptioned", () => {
    const blocked = { ...video([]), playabilityStatus: { status: "LOGIN_REQUIRED", reason: "Sign in to confirm your age" } };
    expect(() => assertCaptioned(blocked, "5d6y3poKwK4")).toThrow(NotPlayableError);
    expect(() => assertCaptioned(blocked, "5d6y3poKwK4")).toThrow(/Sign in/);
  });
});

describe("episodeFromPanel", () => {
  const asr = track("en", "English (auto-generated)", "asr");

  it("assembles the episode from the page's data and the panel's lines", () => {
    const { episode, warning, trackLanguage, trackIsAutoGenerated } = episodeFromPanel(
      video([asr]),
      { segments: [{ stamp: "0:07", text: " Okay, Patrick " }, { stamp: "30:52", text: "Thank you." }], trackLabel: "English (auto-generated)" },
      "5d6y3poKwK4",
    );

    expect(episode).toMatchObject({
      title: "Is AI Breaking the Lean Startup Playbook?",
      channel: "Y Combinator",
      url: "https://www.youtube.com/watch?v=5d6y3poKwK4",
      publishedAt: "2026-07-31",
      durationSeconds: 1860,
      chapters: [{ startSeconds: 0, title: "Intro" }, { startSeconds: 1517, title: "Why now" }],
      segments: [{ text: "Okay, Patrick", startSeconds: 7 }, { text: "Thank you.", startSeconds: 1852 }],
    });
    expect(warning).toBeUndefined();
    expect([trackLanguage, trackIsAutoGenerated]).toEqual(["en", true]);
  });

  it("drops the empty lines the panel renders between sections", () => {
    const { episode } = episodeFromPanel(video([asr]), { segments: [{ stamp: "", text: " " }, { stamp: "30:00", text: "words" }] }, "5d6y3poKwK4");
    expect(episode.segments).toHaveLength(1);
  });

  it("treats a panel with no text as a Blocked Track, worth retrying", () => {
    expect(() => episodeFromPanel(video([asr]), { segments: [] }, "5d6y3poKwK4")).toThrow(TrackUnavailableError);
  });

  it("says so when YouTube showed auto-generated captions although human-written ones exist", () => {
    const { warning } = episodeFromPanel(video([track("en", "English"), asr]), { ...spoken("30:00"), trackLabel: "English (auto-generated)" }, "x");
    expect(warning).toMatch(/human-written ones exist/);
  });

  it("says so when what YouTube showed is a translation", () => {
    const tracks = [track("en", "English"), track("pt-BR", "Portuguese (Brazil)")];
    const { warning, trackLanguage } = episodeFromPanel(video(tracks, { defaultAudioLanguage: "en" }), { ...spoken("30:00"), trackLabel: "Portuguese (Brazil)" }, "x");
    expect(warning).toMatch(/translation/);
    expect(trackLanguage).toBe("pt-BR");
  });

  it("admits it when YouTube does not say which captions it showed", () => {
    const result = episodeFromPanel(video([track("en", "English"), track("pt-BR", "Portuguese (Brazil)")]), spoken("30:00"), "x");
    expect(result.warning).toMatch(/does not say which/);
    expect(result.trackLanguage).toBeUndefined();
    expect(result.trackIsAutoGenerated).toBeUndefined();
  });

  it("never reports a transcript that stops well short of the video as complete", () => {
    const { warning } = episodeFromPanel(video([asr]), spoken("0:07", "12:00"), "x");
    expect(warning).toMatch(/ends at 12:00 of a 31:00 video/);
  });

  it("does not cry wolf over captions that end a little before the video does", () => {
    expect(episodeFromPanel(video([asr]), spoken("0:07", "29:40"), "x").warning).toBeUndefined();
  });
});
