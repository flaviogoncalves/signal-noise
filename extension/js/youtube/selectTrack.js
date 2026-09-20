/** Whether two language codes name the same language: `en-US` and `en` do. Pure. */
export const sameLanguage = (a, b) => a.split("-")[0].toLowerCase() === b.split("-")[0].toLowerCase();
/**
 * Pick the track most faithful to what was actually said.
 *
 * Order: human-written in the original language, then auto-generated in the
 * original language, then anything else — but never quietly. A translation
 * stacks machine translation on machine transcription, so the caller is told.
 */
export function selectTrack(tracks, originalLanguage) {
    if (tracks.length === 0)
        return undefined;
    const isOriginal = (t) => originalLanguage === undefined || sameLanguage(t.languageCode, originalLanguage);
    const isHumanWritten = (t) => t.kind !== "asr";
    const preferred = tracks.find((t) => isOriginal(t) && isHumanWritten(t)) ?? tracks.find(isOriginal);
    if (preferred)
        return { track: preferred };
    const fallback = tracks[0];
    return {
        track: fallback,
        warning: `Only "${fallback.languageCode}" captions are available, but the audio is ` +
            `"${originalLanguage}". This transcript is a translation and will be less accurate.`,
    };
}
