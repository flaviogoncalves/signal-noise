# A side panel, not a popup

The toolbar button opens a side panel beside the video. The popup the extension used to have is gone.

An evaluation streams for tens of seconds. A popup closes the moment the user clicks back on the video — which is the first thing anyone does while waiting — and closing it aborts the request after the tokens are already spent. Moving the request into the background worker would have kept it alive, at the price of a second place for state to live and a worker Chrome is free to suspend. The panel simply stays open, so the request lives exactly as long as the thing displaying it.

## Consequences

Because the panel sits next to the player, a chapter anchor in the summary can move the open video instead of reloading the page. It does so only while the user is still watching that video in that tab; once they have navigated away, the anchor opens like any link.

The panel outlives navigation, which a popup never did: what it shows can be about a video the tab has since left. State about "the video on screen" and "the video the summary is about" is kept apart for that reason.

Permissions: `sidePanel` and `storage` were added, and `activeTab` was dropped — the YouTube host permission already covers everything it did. Requires Chrome 116.
