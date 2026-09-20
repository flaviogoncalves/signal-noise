import { fetchEpisodeWith } from "../youtube/fetchEpisode.js";
import { videoIdFrom } from "../youtube/videoId.js";
/**
 * Fetch from inside the page rather than from the extension.
 *
 * An extension fetch is cross-origin: it carries `Origin: chrome-extension://…` and
 * the user's YouTube cookies, so YouTube sees a logged-in WEB session claiming
 * to be the Android client and answers 403. Running the same request in the
 * page makes it same-origin and it succeeds. The request itself is passed in,
 * so the client identity lives in exactly one place.
 */
function pageFetcher(tabId) {
    return async (url, init) => {
        const [injection] = await chrome.scripting.executeScript({
            target: { tabId },
            world: "MAIN",
            args: [url, init],
            func: async (target, options) => {
                const response = await fetch(target, options);
                return { ok: response.ok, status: response.status, body: await response.text() };
            },
        });
        if (!injection?.result)
            throw new Error("The page did not respond. Try reloading the tab.");
        return injection.result;
    };
}
/** The video in the tab the user is looking at, if that tab is showing one. */
export async function activeVideo() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const videoId = tab?.url ? videoIdFrom(tab.url) : undefined;
    return videoId ? { tabId: tab.id, videoId } : undefined;
}
/**
 * Whether the user is still looking at that video in that tab.
 * The panel outlives navigation: the tab a summary was made from may since have
 * moved to another video, gone to the background, or closed.
 */
export async function isStillWatching(video) {
    try {
        const tab = await chrome.tabs.get(video.tabId);
        return tab.active === true && videoIdFrom(tab.url ?? "") === video.videoId;
    }
    catch {
        return false;
    }
}
/** Harvest the episode playing in a tab. */
export function harvest(tabId, videoId) {
    return fetchEpisodeWith(pageFetcher(tabId), videoId);
}
/** Move the player in a tab to a second, without reloading the page. */
export async function seek(tabId, seconds) {
    await chrome.scripting.executeScript({
        target: { tabId },
        args: [seconds],
        func: (to) => {
            const video = document.querySelector("video");
            if (!video)
                return;
            video.currentTime = to;
            void video.play();
        },
    });
}
