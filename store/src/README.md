# Regenerating the store images

The images in `store/` are made in two steps, both driven by Playwright:

1. `capture.cjs` loads the **built extension** in Chromium, opens a real YouTube video, and screenshots the side panel in the states the listing shows. The SipPulse AI API is mocked, so no key is needed and nothing is billed; the summary text streamed into the panel is the repository's own `examples/output-summary.md`, plus a Fast-mode and a Portuguese rendering of the same facts.
2. `compose.cjs` places those captures into the sizes the Chrome Web Store asks for.

```bash
npm run build:ext
npm install --no-save playwright-core
CHROME=/path/to/chrome node store/src/capture.cjs
CHROME=/path/to/chrome node store/src/compose.cjs
```

`capture.cjs` talks to the real YouTube, which treats an automated browser with suspicion; it retries an evaluation that does not finish. `parts/` holds the intermediate captures and is not committed.
