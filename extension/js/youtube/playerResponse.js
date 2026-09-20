import { parseChapters } from "../format/parseChapters.js";
import { NotPlayableError } from "./errors.js";
/** The video's details, or the reason YouTube will not play it. Pure. */
export function playableDetails(payload) {
    const status = payload.playabilityStatus?.status;
    if (status && status !== "OK") {
        throw new NotPlayableError(payload.playabilityStatus?.reason ?? `Video is ${status}.`);
    }
    if (!payload.videoDetails)
        throw new NotPlayableError("YouTube returned no details for this video.");
    return payload.videoDetails;
}
export const captionTracksOf = (payload) => payload.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
/**
 * The language the video is spoken in. Pure.
 *
 * YouTube does not always say. When it does not, the auto-generated track
 * settles it: speech recognition only ever runs in the language being spoken.
 * Without this, a video with fifty translated tracks and no stated language
 * looks as if every one of them could be the original.
 */
export const originalLanguageOf = (payload) => payload.videoDetails?.defaultAudioLanguage ??
    captionTracksOf(payload).find((track) => track.kind === "asr")?.languageCode;
/** Everything about an episode except what was said in it. Pure. */
export function describeEpisode(payload, videoId) {
    const details = playableDetails(payload);
    const publishDate = payload.microformat?.playerMicroformatRenderer?.publishDate;
    return {
        title: details.title,
        channel: details.author,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        ...(publishDate ? { publishedAt: publishDate.slice(0, 10) } : {}),
        ...(details.lengthSeconds ? { durationSeconds: Number(details.lengthSeconds) } : {}),
        chapters: parseChapters(details.shortDescription ?? ""),
    };
}
