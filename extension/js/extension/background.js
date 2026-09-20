"use strict";
// The toolbar button opens the side panel. A popup would close — and abort the
// evaluation — the moment the user clicked back on the video.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
