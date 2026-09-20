/** A caption track as the player response lists it. */
export interface CaptionTrack {
  languageCode: string;
  /** Present and equal to "asr" when auto-generated. */
  kind?: string;
  baseUrl: string;
  /** The track's name as YouTube shows it, in the viewer's interface language. */
  name?: { simpleText?: string };
}

export interface TrackChoice {
  track: CaptionTrack;
  /** Set only when the chosen track is a compromise worth telling the user about. */
  warning?: string;
}

/**
 * Pick the track most faithful to what was actually said.
 *
 * Order: human-written in the original language, then auto-generated in the
 * original language, then anything else — but never quietly. A translation
 * stacks machine translation on machine transcription, so the caller is told.
 */
export function selectTrack(
  tracks: readonly CaptionTrack[],
  originalLanguage: string | undefined,
): TrackChoice | undefined {
  if (tracks.length === 0) return undefined;

  const isOriginal = (t: CaptionTrack): boolean =>
    originalLanguage === undefined || t.languageCode === originalLanguage;
  const isHumanWritten = (t: CaptionTrack): boolean => t.kind !== "asr";

  const preferred =
    tracks.find((t) => isOriginal(t) && isHumanWritten(t)) ?? tracks.find(isOriginal);

  if (preferred) return { track: preferred };

  const fallback = tracks[0]!;
  return {
    track: fallback,
    warning:
      `Only "${fallback.languageCode}" captions are available, but the audio is ` +
      `"${originalLanguage}". This transcript is a translation and will be less accurate.`,
  };
}
