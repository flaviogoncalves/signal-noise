/** A chapter marker taken from the video's own description. */
export interface Chapter {
  startSeconds: number;
  title: string;
}

/** One caption fragment as delivered by a Transcript Source. */
export interface Segment {
  text: string;
  /** When the fragment is spoken, for a Transcript Source that knows. */
  startSeconds?: number;
}

/**
 * A podcast episode, assembled from the page and a Transcript Source,
 * ready to be turned into the text that lands on the clipboard.
 */
export interface Episode {
  title: string;
  channel: string;
  url: string;
  /** ISO date from the page, when it exposes one. */
  publishedAt?: string;
  durationSeconds?: number;
  chapters: Chapter[];
  segments: Segment[];
}
