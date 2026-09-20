import { describe, expect, it } from "vitest";
import { TrackUnavailableError } from "./errors.js";
import { assertTrackBody } from "./fetchEpisode.js";

/** What YouTube serves when it is blocking caption downloads from a network. */
const SORRY_PAGE =
  '<html><head><title>Sorry...</title></head><body><div><h1>We\'re sorry...</h1>' +
  "<p>... but your computer or network may be sending automated queries.</p></div></body></html>";

const TRACK = '<timedtext format="3"><body><p t="0" d="1200">never gonna give you up</p></body></timedtext>';

describe("assertTrackBody", () => {
  it("accepts a real timedtext track", () => {
    expect(() => assertTrackBody(200, TRACK)).not.toThrow();
  });

  it("accepts the legacy <text> track format", () => {
    expect(() => assertTrackBody(200, '<transcript><text start="0">hello</text></transcript>')).not.toThrow();
  });

  it("blames the network, not the episode, when YouTube rate-limits the download", () => {
    expect(() => assertTrackBody(429, SORRY_PAGE)).toThrow(TrackUnavailableError);
    expect(() => assertTrackBody(429, SORRY_PAGE)).toThrow(/does have captions/);
  });

  it("catches the bot wall even when it arrives with a 200", () => {
    expect(() => assertTrackBody(200, SORRY_PAGE)).toThrow(TrackUnavailableError);
  });

  it("reports the status when YouTube refuses outright", () => {
    expect(() => assertTrackBody(403, "")).toThrow(/HTTP 403/);
  });

  it("rejects a body that is not a caption track at all", () => {
    expect(() => assertTrackBody(200, "")).toThrow(TrackUnavailableError);
  });
});
