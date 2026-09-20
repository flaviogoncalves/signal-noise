import { NoCaptionsError, TrackUnavailableError } from "./errors.js";
import { captionTracksOf, describeEpisode, originalLanguageOf, } from "./playerResponse.js";
/**
 * Pull `ytInitialPlayerResponse` out of a watch page. Pure.
 *
 * The object is found by matching braces rather than by a regex up to `};`,
 * because a description is free text and can contain exactly that.
 */
export function parseWatchHtml(html) {
    const marker = html.indexOf("ytInitialPlayerResponse");
    const start = marker === -1 ? -1 : html.indexOf("{", marker);
    if (start === -1)
        return undefined;
    let depth = 0;
    let inString = false;
    for (let i = start; i < html.length; i++) {
        const char = html[i];
        if (inString) {
            if (char === "\\")
                i++;
            else if (char === '"')
                inString = false;
        }
        else if (char === '"') {
            inString = true;
        }
        else if (char === "{") {
            depth++;
        }
        else if (char === "}" && --depth === 0) {
            try {
                return JSON.parse(html.slice(start, i + 1));
            }
            catch {
                return undefined;
            }
        }
    }
    return undefined;
}
/** `1:02:03` or `4:05` as seconds, or undefined when it is not a timestamp. Pure. */
export function stampToSeconds(stamp) {
    if (!/^\d+(:\d{2}){1,2}$/.test(stamp.trim()))
        return undefined;
    return stamp
        .trim()
        .split(":")
        .reduce((total, part) => total * 60 + Number(part), 0);
}
/**
 * Which caption track the panel showed. Pure.
 *
 * The panel names the track in the viewer's interface language, and so does
 * the track list from the same page, so the two can be matched exactly. When
 * the panel does not name it, a video with a single track leaves no doubt;
 * otherwise the answer is "unknown", never a guess.
 */
export function identifyTrack(tracks, trackLabel) {
    const label = trackLabel?.trim();
    const named = label ? tracks.find((track) => track.name?.simpleText?.trim() === label) : undefined;
    return named ?? (tracks.length === 1 ? tracks[0] : undefined);
}
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
/** Everything about the transcript the user should be told, or undefined when it is as good as it gets. */
function compromises(payload, track, lastSpokenAt) {
    const tracks = captionTracksOf(payload);
    const original = originalLanguageOf(payload);
    const duration = Number(payload.videoDetails?.lengthSeconds ?? 0);
    const notes = [];
    if (!track) {
        notes.push("YouTube chose which captions to show and does not say which. " +
            "If they are a translation, the summary was made from a translation.");
    }
    else if (original && track.languageCode !== original) {
        notes.push(`YouTube showed "${track.languageCode}" captions, but the audio is "${original}". ` +
            "This transcript is a translation and will be less accurate.");
    }
    else if (track.kind === "asr" &&
        tracks.some((other) => other.kind !== "asr" && other.languageCode === track.languageCode)) {
        notes.push("YouTube showed its auto-generated captions although human-written ones exist for this video, " +
            "so expect more transcription errors.");
    }
    // Captions often stop a little before the video does; a quarter of it missing is not that.
    if (duration >= 120 && lastSpokenAt !== undefined && lastSpokenAt < duration * 0.75) {
        notes.push(`The transcript YouTube showed ends at ${clock(lastSpokenAt)} of a ${clock(duration)} video, ` +
            "so the rest of it is missing from the summary.");
    }
    return notes.length ? notes.join(" ") : undefined;
}
/** Refuse before touching the page when the video has nothing to show. Pure. */
export function assertCaptioned(payload, videoId) {
    describeEpisode(payload, videoId);
    if (captionTracksOf(payload).length === 0)
        throw new NoCaptionsError(videoId);
}
/** Assemble the episode from the page's own data and what the transcript panel showed. Pure. */
export function episodeFromPanel(payload, reading, videoId) {
    const segments = reading.segments
        .map(({ stamp, text }) => {
        const startSeconds = stampToSeconds(stamp);
        return { text: text.trim(), ...(startSeconds === undefined ? {} : { startSeconds }) };
    })
        .filter((segment) => segment.text.length > 0);
    if (segments.length === 0) {
        throw new TrackUnavailableError("YouTube opened its transcript panel but showed no text. The episode has captions; try again.");
    }
    const track = identifyTrack(captionTracksOf(payload), reading.trackLabel);
    const warning = compromises(payload, track, segments.at(-1)?.startSeconds);
    return {
        episode: { ...describeEpisode(payload, videoId), segments },
        ...(warning ? { warning } : {}),
        ...(track ? { trackLanguage: track.languageCode, trackIsAutoGenerated: track.kind === "asr" } : {}),
    };
}
