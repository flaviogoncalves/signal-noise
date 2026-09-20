import { playerRequest, pickTrack, buildEpisode, assertTrackBody, NotPlayableError, } from "../youtube/fetchEpisode.js";
/**
 * Fetch from inside the page rather than from the extension.
 *
 * An extension fetch is cross-origin: it carries `Origin: chrome-extension://…` and
 * the user's YouTube cookies, so YouTube sees a logged-in WEB session claiming
 * to be the Android client and answers 403. Running the same request in the
 * page makes it same-origin and it succeeds. The request itself is passed in,
 * so the client identity lives in exactly one place.
 */
async function fetchInPage(tabId, url, init) {
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
}
/** Harvest the episode playing in a tab. */
export async function harvest(tabId, videoId) {
    const { url, init } = playerRequest(videoId);
    const player = await fetchInPage(tabId, url, init);
    if (!player.ok)
        throw new NotPlayableError(`YouTube refused the request (HTTP ${player.status}).`);
    const payload = JSON.parse(player.body);
    const choice = pickTrack(payload, videoId);
    const track = await fetchInPage(tabId, choice.track.baseUrl, {});
    assertTrackBody(track.status, track.body);
    return buildEpisode(payload, track.body, videoId, choice);
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
