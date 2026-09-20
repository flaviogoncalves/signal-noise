const BASE_URL = "https://api.sippulse.ai/v1/openai";

/** A failure the user can act on: a bad key, no credits, a rate limit, a refused request. */
export class SipPulseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SipPulseError";
  }
}

/**
 * The key works, but its account cannot use the model the extension runs on.
 *
 * The message names no model, because the interface never does. What the key
 * could see travels on the error instead, for whoever is debugging with the console open.
 */
export class ModelUnavailableError extends SipPulseError {
  constructor(readonly seen: string[]) {
    super(
      "This key cannot use the model Signal / Noise runs on. " +
        "Ask SipPulse AI support to enable it for your account.",
    );
    this.name = "ModelUnavailableError";
  }
}

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

/** A date stamped into a model id — `2024-11`, `20250115` — which is not a version. */
const DATE_STAMP = /(?<!\d)(?:20\d{2}[-_.]?\d{2}(?:[-_.]?\d{2})?)(?!\d)/g;

/** "4.1" as a version: `4.1`, `4-1`, `4_1` or `v41`, and never the start of `4.10`. */
const VERSION_4_1 = /(?<![\d.])(?:v41|v?4[._-]1)(?![\d])/i;

/**
 * Find DeepSeek 4.1 Flash among the ids a key can see. Pure.
 *
 * The id is resolved from the account rather than hardcoded because the
 * catalog is per-organization and spells its ids its own way. But it is this
 * model or nothing: there is no "newest Flash" fallback, because a summary's
 * quality is only attributable when the model that wrote it is the one named.
 * When variants exist (`-lite`, a dated snapshot), the shortest id is the base model.
 */
export function resolveModel(ids: string[]): string {
  const isFlash = (id: string): boolean => /deepseek/i.test(id) && /flash/i.test(id);

  const [chosen] = ids
    .filter((id) => isFlash(id) && VERSION_4_1.test(id.replace(DATE_STAMP, "")))
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
  if (chosen) return chosen;

  throw new ModelUnavailableError(ids);
}

export interface StreamParser {
  /** Feed a chunk of the response; get back the summary text it completed. */
  push(chunk: string): string;
  /** The stream is over: get back whatever a missing final newline was holding. */
  end(): string;
  finishReason?: string;
}

/**
 * Accumulate a streamed completion. No I/O — fed text, returns text.
 *
 * Chunks split wherever the network pleases, including mid-line, so a partial
 * line is held back until its newline arrives. Only `delta.content` is signal:
 * a reasoning model also streams `reasoning_content`, which is the model
 * thinking out loud and must never reach the summary.
 */
export function createStreamParser(): StreamParser {
  let buffer = "";

  const parser: StreamParser = {
    push(chunk) {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      let text = "";
      for (const line of lines) {
        const match = /^data:\s?(.*)$/.exec(line.replace(/\r$/, ""));
        if (!match?.[1] || match[1] === "[DONE]") continue;

        let event: StreamEvent;
        try {
          event = JSON.parse(match[1]) as StreamEvent;
        } catch {
          continue;
        }

        if (event.error) {
          throw new SipPulseError(event.error.message ?? "SipPulse AI failed mid-stream.");
        }

        const choice = event.choices?.[0];
        if (choice?.finish_reason) parser.finishReason = choice.finish_reason;
        text += choice?.delta?.content ?? "";
      }
      return text;
    },
    end: () => parser.push("\n"),
  };
  return parser;
}

/** Read a completion that arrived as one JSON document instead of a stream. Pure. */
export function readWholeCompletion(payload: WholeCompletion): { text: string; finishReason?: string } {
  const choice = payload.choices?.[0];
  return {
    text: choice?.message?.content ?? "",
    ...(choice?.finish_reason ? { finishReason: choice.finish_reason } : {}),
  };
}

/** Turn an error response into something the user can act on. Pure. */
export function explainFailure(status: number, body: string): SipPulseError {
  let detail = "";
  try {
    detail = (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? "";
  } catch {
    // Not JSON — a gateway page. The status says enough.
  }

  const rejected = status === 401 || status === 403;
  const reason = rejected
    ? "SipPulse AI rejected the key. Check it in Settings."
    : status === 402
      ? "The SipPulse AI organization is out of credits. Top up and try again."
      : status === 429
        ? "SipPulse AI is rate-limiting this key. Wait a moment and try again."
        : `SipPulse AI refused the request (HTTP ${status}).`;

  // A rejected key gets no detail: the API words it for a developer ("Authorization
  // header not found"), which sends a user looking for a header instead of their key.
  return new SipPulseError(detail && !rejected ? `${reason} — ${detail}` : reason);
}

/** The model ids this key can use. Doubles as the key check: a bad key fails here. */
export async function listModels(apiKey: string): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/models`, { headers: { "api-key": apiKey } });
  if (!response.ok) throw explainFailure(response.status, await response.text());

  const payload = (await response.json()) as { data?: { id: string }[] };
  return (payload.data ?? []).map((model) => model.id);
}

/**
 * Run a completion, handing text to `onText` as it arrives.
 * Resolves with the finish reason, so the caller can tell a cut-off answer from a complete one.
 */
export async function streamCompletion(request: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  onText: (text: string) => void;
  signal?: AbortSignal;
}): Promise<string | undefined> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": request.apiKey },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      // Low, because the job is fidelity to the transcript, not variety between runs.
      temperature: 0.2,
      stream: true,
    }),
    ...(request.signal ? { signal: request.signal } : {}),
  });

  if (!response.ok) throw explainFailure(response.status, await response.text());

  // A deployment that ignores `stream` answers with one JSON document.
  if (!response.body || response.headers.get("content-type")?.includes("application/json")) {
    const whole = readWholeCompletion((await response.json()) as WholeCompletion);
    request.onText(whole.text);
    return whole.finishReason;
  }

  const parser = createStreamParser();
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = parser.push(value);
    if (text) request.onText(text);
  }
  const tail = parser.end();
  if (tail) request.onText(tail);
  return parser.finishReason;
}

interface WholeCompletion {
  choices?: { message?: { content?: string | null }; finish_reason?: string | null }[];
}

interface StreamEvent {
  error?: { message?: string };
  choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[];
}
