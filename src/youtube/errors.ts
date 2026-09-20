/**
 * Anything that stops an episode from being harvested and that the user can be
 * told about in plain words. Callers catch this one class; the subclasses say
 * whether it was a refusal or a failure.
 */
export class EpisodeError extends Error {}

/** An Uncaptioned Episode: a refusal. There is nothing to harvest, and retrying will not help. */
export class NoCaptionsError extends EpisodeError {
  constructor(readonly videoId: string) {
    super("This episode has no captions, so there is no transcript to harvest.");
    this.name = "NoCaptionsError";
  }
}

export class NotPlayableError extends EpisodeError {}

/**
 * A Blocked Track: the episode has captions, but YouTube would not hand the track over.
 *
 * Distinct from {@link NoCaptionsError} on purpose: that one is a refusal —
 * there is nothing to harvest — while this one is a failure, and the caller
 * should try again rather than conclude the episode is uncaptioned.
 */
export class TrackUnavailableError extends EpisodeError {
  constructor(message: string) {
    super(message);
    this.name = "TrackUnavailableError";
  }
}
