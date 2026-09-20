import { describe, expect, it } from "vitest";
import {
  ModelUnavailableError,
  createStreamParser,
  explainFailure,
  readWholeCompletion,
  resolveModel,
  SipPulseError,
} from "./client.js";

const event = (delta: object, finish: string | null = null) =>
  `data: ${JSON.stringify({ choices: [{ delta, finish_reason: finish }] })}\n\n`;

describe("resolveModel", () => {
  it("picks DeepSeek 4.1 Flash when the key can see it", () => {
    expect(resolveModel(["gpt-4o", "deepseek-v4-flash", "deepseek-v4.1-flash", "deepseek-v4.1-pro"])).toBe(
      "deepseek-v4.1-flash",
    );
  });

  it("recognises 4.1 however the catalog spells it", () => {
    for (const id of ["deepseek-4-1-flash", "DeepSeek-V4_1-Flash", "deepseek-ai/deepseek-v41-flash", "deepseek-flash-4.1"]) {
      expect(resolveModel(["gpt-4o", id])).toBe(id);
    }
  });

  it("does not mistake a date stamp for a version", () => {
    expect(() => resolveModel(["deepseek-v3-flash-2024-11", "deepseek-v4-flash-20250411"])).toThrow(SipPulseError);
    expect(resolveModel(["deepseek-v3-flash-2024-11", "deepseek-v4.1-flash-2025-04-11"])).toBe(
      "deepseek-v4.1-flash-2025-04-11",
    );
  });

  it("does not read 4.10 or 14.1 as 4.1", () => {
    expect(() => resolveModel(["deepseek-v4.10-flash", "deepseek-v14.1-flash"])).toThrow(SipPulseError);
  });

  it("prefers the base model over its variants", () => {
    expect(resolveModel(["deepseek-v4.1-flash-lite", "deepseek-v4.1-flash", "deepseek-v4.1-flash-2025-04-11"])).toBe(
      "deepseek-v4.1-flash",
    );
  });

  it("refuses rather than using an older Flash", () => {
    expect(() => resolveModel(["gpt-4o", "deepseek-v4-flash", "deepseek-r1"])).toThrow(ModelUnavailableError);
    expect(() => resolveModel([])).toThrow(ModelUnavailableError);
  });

  it("never names a model to the user, and keeps what it saw for whoever is debugging", () => {
    const ids = ["gpt-4o", "deepseek-v4-flash"];
    const refusal = (() => {
      try {
        return resolveModel(ids);
      } catch (error) {
        return error as ModelUnavailableError;
      }
    })();

    expect(refusal).toBeInstanceOf(ModelUnavailableError);
    expect((refusal as ModelUnavailableError).message).not.toMatch(/deepseek|flash|gpt|4\.1/i);
    expect((refusal as ModelUnavailableError).seen).toEqual(ids);
  });
});

describe("createStreamParser", () => {
  it("joins the content deltas", () => {
    const parser = createStreamParser();
    expect(parser.push(event({ content: "## Ver" }) + event({ content: "dict" }))).toBe("## Verdict");
  });

  it("holds a line back until the rest of it arrives", () => {
    const parser = createStreamParser();
    const whole = event({ content: "signal" });
    expect(parser.push(whole.slice(0, 20))).toBe("");
    expect(parser.push(whole.slice(20))).toBe("signal");
  });

  it("drops the model's reasoning, which is not part of the answer", () => {
    const parser = createStreamParser();
    expect(parser.push(event({ reasoning_content: "let me think" }) + event({ content: "ok" }))).toBe("ok");
  });

  it("records why the model stopped", () => {
    const parser = createStreamParser();
    parser.push(event({ content: "cut of" }, "length") + "data: [DONE]\n\n");
    expect(parser.finishReason).toBe("length");
  });

  it("gives up a last line that never got its newline when the stream ends", () => {
    const parser = createStreamParser();
    expect(parser.push(event({ content: "last" }).trimEnd())).toBe("");
    expect(parser.end()).toBe("last");
    expect(parser.end()).toBe("");
  });

  it("surfaces an error sent mid-stream instead of ending quietly", () => {
    const parser = createStreamParser();
    expect(() => parser.push('data: {"error":{"statusCode":402,"message":"no credits"}}\n\n')).toThrow(
      /no credits/,
    );
  });
});

describe("readWholeCompletion", () => {
  it("reads a completion from a deployment that ignored `stream`", () => {
    expect(readWholeCompletion({ choices: [{ message: { content: "## Verdict" }, finish_reason: "stop" }] })).toEqual({
      text: "## Verdict",
      finishReason: "stop",
    });
  });

  it("reads an empty answer as empty rather than throwing", () => {
    expect(readWholeCompletion({})).toEqual({ text: "" });
    expect(readWholeCompletion({ choices: [{ message: { content: null } }] })).toEqual({ text: "" });
  });
});

describe("explainFailure", () => {
  it("points a rejected key at Settings", () => {
    expect(explainFailure(401, '{"error":{"message":"Authorization header not found"}}').message).toBe(
      "SipPulse AI rejected the key. Check it in Settings.",
    );
  });

  it("words 401 and 403 the same way, without the API's developer-facing detail", () => {
    expect(explainFailure(403, '{"error":{"message":"Forbidden resource"}}').message).toBe(
      explainFailure(401, "{}").message,
    );
  });

  it("keeps the API's own detail, which is where a context-length refusal shows up", () => {
    expect(explainFailure(400, '{"error":{"message":"maximum context length exceeded"}}').message).toMatch(
      /HTTP 400.*maximum context length/,
    );
  });

  it("survives a gateway page that is not JSON", () => {
    expect(explainFailure(502, "<html>Bad gateway</html>").message).toMatch(/HTTP 502/);
  });
});
