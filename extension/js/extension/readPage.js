/** The watch page's own HTML, which carries the video's title, length, description and caption list. */
export async function fetchWatchHtml(videoId) {
    const response = await fetch(`/watch?v=${encodeURIComponent(videoId)}`, { credentials: "same-origin" });
    return response.ok ? response.text() : "";
}
/**
 * Open YouTube's own transcript panel, choose the captions we want, and read what it shows.
 *
 * This is what a viewer does by clicking "Show transcript" and picking a
 * language: YouTube fetches and renders its transcript, and we read the
 * result. Nothing here asks YouTube for anything the page would not ask for itself.
 *
 * YouTube serves the panel in more than one build, with different markup and
 * different panel ids, so the panel is recognised by what it contains rather
 * than by what it is called. Only the older build offers a language menu; in
 * the newer one YouTube's choice stands, and the caller is told it is unknown.
 *
 * `preferredLabel` is the wanted track's name exactly as the page lists it.
 * It matters more than it looks: left alone, YouTube's own choice varies from
 * one load to the next, and on a video with many tracks it sometimes opens on
 * the first one alphabetically and fails to load it.
 */
export async function readTranscriptPanel(preferredLabel) {
    const SEGMENT = "ytd-transcript-segment-renderer, transcript-segment-view-model";
    const TRANSCRIPT = `ytd-transcript-renderer, ${SEGMENT}`;
    const STAMP = ".segment-timestamp, .ytwTranscriptSegmentViewModelTimestamp";
    const TEXT = ".segment-text, [role=text]";
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const until = async (probe, ms) => {
        for (const end = Date.now() + ms; Date.now() < end; await pause(100)) {
            const found = probe();
            if (found)
                return found;
        }
        return undefined;
    };
    const openPanel = () => Array.from(document.querySelectorAll("ytd-engagement-panel-section-list-renderer")).find((panel) => panel.getAttribute("visibility")?.endsWith("EXPANDED") && panel.querySelector(TRANSCRIPT));
    let panel = openPanel();
    const openedByUs = !panel;
    if (!panel) {
        const button = await until(() => document.querySelector("ytd-video-description-transcript-section-renderer button"), 10_000);
        if (!button)
            return { failure: "no-button" };
        button.click();
        panel = await until(openPanel, 15_000);
        if (!panel)
            return { failure: "no-segments" };
    }
    const found = panel;
    const close = () => found.querySelector("#visibility-button button")?.click();
    const shownLabel = () => found.querySelector("ytd-transcript-footer-renderer")?.innerText.trim() || undefined;
    if (preferredLabel) {
        // The menu's items are in the page before the menu is opened, so the wanted one can be clicked directly.
        const item = await until(() => Array.from(found.querySelectorAll("ytd-transcript-footer-renderer yt-dropdown-menu a")).find((option) => option.textContent?.trim() === preferredLabel), found.querySelector("ytd-transcript-renderer") ? 3_000 : 0);
        if (item && shownLabel() !== preferredLabel) {
            item.click();
            await until(() => shownLabel() === preferredLabel, 8_000);
        }
    }
    // Lines keep arriving after the first ones render. Wait until there are some and the count holds still.
    let count = -1;
    const deadline = Date.now() + 12_000;
    for (let steady = 0; steady < 3 && Date.now() < deadline; await pause(250)) {
        const now = found.querySelectorAll(SEGMENT).length;
        steady = now > 0 && now === count ? steady + 1 : 0;
        count = now;
    }
    if (count <= 0) {
        // YouTube's own request failed and left the panel empty. Close it, so that asking again makes a new request.
        close();
        return { failure: "no-segments" };
    }
    const segments = Array.from(found.querySelectorAll(SEGMENT)).map((line) => ({
        stamp: (line.querySelector(STAMP)?.textContent ?? "").trim(),
        text: (line.querySelector(TEXT)?.textContent ?? "").replace(/\s+/g, " ").trim(),
    }));
    // innerText, not textContent: the closed language menu holds every language, the visible text only the chosen one.
    const trackLabel = shownLabel();
    // Leave the page as it was found.
    if (openedByUs)
        close();
    return { segments, ...(trackLabel ? { trackLabel } : {}) };
}
