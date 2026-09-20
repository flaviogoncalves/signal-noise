import { videoIdFrom } from "./videoId.js";

/**
 * The second a summary link points at, when it points into the given video. Pure.
 *
 * Lets a click on an anchor move the player that is already open instead of
 * reloading the page. A link to any other video is left to open normally.
 */
export function seekTargetFrom(href: string, videoId: string): number | undefined {
  if (!URL.canParse(href) || videoIdFrom(href) !== videoId) return undefined;

  const t = new URL(href).searchParams.get("t");
  const seconds = t === null ? NaN : Number(t.replace(/s$/, ""));
  return Number.isInteger(seconds) && seconds >= 0 ? seconds : undefined;
}
