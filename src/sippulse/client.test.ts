import { describe, expect, it } from "vitest";
import { createStreamParser, explainFailure, resolveModel, SipPulseError } from "./client.js";

const event = (delta: object, finish: string | null = null) =>
  `data: ${JSON.stringify({ choices: [{ delta, finish_reason: finish }] })}\n\n`;

describe("resolveModel", () => {
  it("picks DeepSeek 4.1 Flash when the key can see it", () => {
    expect(resolveModel(["gpt-4o", "deepseek-v4-flash", "deepseek-v4.1-flash", "deepseek-v4.1-pro"])).toBe(
      "deepseek-v4.1-flash",
    );
  });

  it("falls back to the newest Flash when 4.1 is not offered", () => {
    expect(resolveModel(["deepseek-v3-flash", "deepseek-v4-flash", "deepseek-r1"])).toBe("deepseek-v4-flash");
  });

  it("refuses rather than quietly using a different model", () => {
    expect(() => resolveModel(["gpt-4o", "deepseek-r1"])).toThrow(SipPulseError);
    expect(() => resolveModel(["gpt-4o", "deepseek-r1"])).toThrow(/gpt-4o, deepseek-r1/);
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

  it("surfaces an error sent mid-stream instead of ending quietly", () => {
    const parser = createStreamParser();
    expect(() => parser.push('data: {"error":{"statusCode":402,"message":"no credits"}}\n\n')).toThrow(
      /no credits/,
    );
  });
});

describe("explainFailure", () => {
  it("points a rejected key at Settings", () => {
    expect(explainFailure(401, '{"error":{"message":"Authorization header not found"}}').message).toBe(
      "SipPulse AI rejected the key. Check it in Settings.",
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
