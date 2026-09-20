const BASE_URL = "https://api.sippulse.ai/v1/openai";
/** A failure the user can act on: a bad key, no credits, a rate limit, a refused request. */
export class SipPulseError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "SipPulseError";
    }
}
/**
 * Choose the DeepSeek Flash model from the ids a key can see. Pure.
 *
 * The id is resolved from the account rather than hardcoded because the
 * catalog is per-organization and renames models between releases. 4.1 wins
 * when it is there; otherwise the highest-versioned Flash does.
 */
export function resolveModel(ids) {
    const flash = ids
        .filter((id) => /deepseek/i.test(id) && /flash/i.test(id))
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    const chosen = flash.find((id) => /4[.\-_]1/.test(id)) ?? flash.at(-1);
    if (chosen)
        return chosen;
    const seen = ids.length === 0 ? "none" : ids.slice(0, 8).join(", ");
    throw new SipPulseError(200, `This key has no DeepSeek Flash model available. Models it can use: ${seen}.`);
}
/**
 * Accumulate a streamed completion. Pure — fed text, returns text.
 *
 * Chunks split wherever the network pleases, including mid-line, so a partial
 * line is held back until its newline arrives. Only `delta.content` is signal:
 * a reasoning model also streams `reasoning_content`, which is the model
 * thinking out loud and must never reach the summary.
 */
export function createStreamParser() {
    let buffer = "";
    const parser = {
        push(chunk) {
            buffer += chunk;
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            let text = "";
            for (const line of lines) {
                const match = /^data:\s?(.*)$/.exec(line.replace(/\r$/, ""));
                if (!match?.[1] || match[1] === "[DONE]")
                    continue;
                let event;
                try {
                    event = JSON.parse(match[1]);
                }
                catch {
                    continue;
                }
                if (event.error) {
                    throw new SipPulseError(event.error.statusCode ?? 500, event.error.message ?? "SipPulse AI failed mid-stream.");
                }
                const choice = event.choices?.[0];
                if (choice?.finish_reason)
                    parser.finishReason = choice.finish_reason;
                text += choice?.delta?.content ?? "";
            }
            return text;
        },
    };
    return parser;
}
/** Turn an error response into something the user can act on. Pure. */
export function explainFailure(status, body) {
    let detail = "";
    try {
        detail = JSON.parse(body).error?.message ?? "";
    }
    catch {
        // Not JSON — a gateway page. The status says enough.
    }
    const reason = status === 401 || status === 403
        ? "SipPulse AI rejected the key. Check it in Settings."
        : status === 402
            ? "The SipPulse AI organization is out of credits. Top up and try again."
            : status === 429
                ? "SipPulse AI is rate-limiting this key. Wait a moment and try again."
                : `SipPulse AI refused the request (HTTP ${status}).`;
    return new SipPulseError(status, detail && status !== 401 ? `${reason} — ${detail}` : reason);
}
/** The model ids this key can use. Doubles as the key check: a bad key fails here. */
export async function listModels(apiKey) {
    const response = await fetch(`${BASE_URL}/models`, { headers: { "api-key": apiKey } });
    if (!response.ok)
        throw explainFailure(response.status, await response.text());
    const payload = (await response.json());
    return (payload.data ?? []).map((model) => model.id);
}
/**
 * Run a completion, handing text to `onText` as it arrives.
 * Resolves with the finish reason, so the caller can tell a cut-off answer from a complete one.
 */
export async function streamCompletion(request) {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": request.apiKey },
        body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            temperature: 0.2,
            stream: true,
        }),
        ...(request.signal ? { signal: request.signal } : {}),
    });
    if (!response.ok)
        throw explainFailure(response.status, await response.text());
    // A deployment that ignores `stream` answers with one JSON document.
    if (!response.body || response.headers.get("content-type")?.includes("application/json")) {
        const payload = (await response.json());
        request.onText(payload.choices?.[0]?.message?.content ?? "");
        return payload.choices?.[0]?.finish_reason;
    }
    const parser = createStreamParser();
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    for (;;) {
        const { done, value } = await reader.read();
        if (done)
            break;
        const text = parser.push(value);
        if (text)
            request.onText(text);
    }
    const tail = parser.push("\n");
    if (tail)
        request.onText(tail);
    return parser.finishReason;
}
