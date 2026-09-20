import { parseChapters } from "../format/parseChapters.js";
import { NotPlayableError } from "./errors.js";
import { sameLanguage } from "./selectTrack.js";
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
/** YouTube's id for an audio track it dubbed by machine ends in this; the uploader's own audio does not. */
const MACHINE_DUBBED = /\.10$/;
/**
 * The language the video is spoken in. Pure.
 *
 * YouTube does not always say, and without knowing, a talk with fifty
 * translated tracks looks as if any of them could be the original. Two things
 * settle it, in this order:
 *
 * 1. The audio track YouTube did not dub. A machine-dubbed video lists its
 *    dubs next to the original, and only the original lacks the dub marker.
 * 2. The auto-generated captions, since speech recognition runs on what is
 *    spoken — but only when they agree. A dubbed video can list one
 *    auto-generated track per dub, and then they say nothing.
 */
export function originalLanguageOf(payload) {
    const stated = payload.videoDetails?.defaultAudioLanguage;
    if (stated)
        return stated;
    const audio = payload.captions?.playerCaptionsTracklistRenderer?.audioTracks ?? [];
    const undubbed = audio.map((track) => track.audioTrackId ?? "").filter((id) => id && !MACHINE_DUBBED.test(id));
    if (audio.length > 1 && undubbed.length === 1)
        return undubbed[0].replace(/\.\d+$/, "");
    const recognised = captionTracksOf(payload).filter((track) => track.kind === "asr");
    const [first] = recognised;
    return first && recognised.every((track) => sameLanguage(track.languageCode, first.languageCode))
        ? first.languageCode
        : undefined;
}
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
