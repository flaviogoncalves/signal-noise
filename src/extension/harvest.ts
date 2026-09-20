import { NotPlayableError, TrackUnavailableError } from "../youtube/errors.js";
import { assertCaptioned, episodeFromPanel, parseWatchHtml } from "../youtube/panelTranscript.js";
import { captionTracksOf, originalLanguageOf, type FetchedEpisode } from "../youtube/playerResponse.js";
import { selectTrack } from "../youtube/selectTrack.js";
import { videoIdFrom } from "../youtube/videoId.js";
import { fetchWatchHtml, readTranscriptPanel } from "./readPage.js";

declare const chrome: any;

/** Run a self-contained function inside the tab, in the extension's isolated world. */
async function inPage<Args extends unknown[], Result>(
  tabId: number,
  func: (...args: Args) => Promise<Result>,
  args: Args,
): Promise<Result> {
  const [injection] = await chrome.scripting.executeScript({ target: { tabId }, func, args });
  if (injection?.result === undefined || injection.result === null) {
    throw new Error("The page did not respond. Try reloading the tab.");
  }
  return injection.result;
}

/** A YouTube video open in a tab. */
export interface OpenVideo {
  tabId: number;
  videoId: string;
}

/** The video in the tab the user is looking at, if that tab is showing one. */
export async function activeVideo(): Promise<OpenVideo | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const videoId = tab?.url ? videoIdFrom(tab.url) : undefined;
  return videoId ? { tabId: tab.id, videoId } : undefined;
}

/**
 * Whether the user is still looking at that video in that tab.
 * The panel outlives navigation: the tab a summary was made from may since have
 * moved to another video, gone to the background, or closed.
 */
export async function isStillWatching(video: OpenVideo): Promise<boolean> {
  try {
    const tab = await chrome.tabs.get(video.tabId);
    return tab.active === true && videoIdFrom(tab.url ?? "") === video.videoId;
  } catch {
    return false;
  }
}

/**
 * Harvest the episode playing in a tab, from what the page itself shows.
 *
 * The page's own data says whether there is anything to harvest, so an
 * Uncaptioned Episode is refused before the page is touched. Only then is
 * YouTube's transcript panel opened and read.
 */
export async function harvest(tabId: number, videoId: string): Promise<FetchedEpisode> {
  const player = parseWatchHtml(await inPage(tabId, fetchWatchHtml, [videoId]));
  if (!player) throw new NotPlayableError("YouTube's page did not describe this video. Reload the tab and try again.");
  assertCaptioned(player, videoId);

  // The same preference as ever — human-written in the original language, then auto-generated —
  // expressed the only way the page understands it: the track's name in the language menu.
  const wanted = selectTrack(captionTracksOf(player), originalLanguageOf(player))?.track.name?.simpleText;
  const label: [string?] = wanted ? [wanted] : [];

  const reading = await inPage(tabId, readTranscriptPanel, label);
  if ("failure" in reading) {
    throw new TrackUnavailableError(
      reading.failure === "no-button"
        ? "YouTube did not offer its transcript for this video, although it has captions. Reload the tab and try again."
        : "YouTube opened its transcript panel but nothing loaded in it. The episode does have captions; try again.",
    );
  }

  return episodeFromPanel(player, reading, videoId);
}

/** Move the player in a tab to a second, without reloading the page. */
export async function seek(tabId: number, seconds: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    args: [seconds],
    func: (to: number) => {
      const video = document.querySelector("video");
      if (!video) return;
      video.currentTime = to;
      void video.play();
    },
  });
}
