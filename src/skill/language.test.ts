import { describe, expect, it } from "vitest";
import { AUTO, outputLanguage, SOURCE } from "./language.js";

describe("outputLanguage", () => {
  it("names the language that was picked, whatever the browser speaks", () => {
    expect(outputLanguage("pt-BR", "en-US")).toBe("Brazilian Portuguese");
    expect(outputLanguage("en", "pt-BR")).toBe("English");
  });

  it("follows the browser when left on auto, or when nothing was ever stored", () => {
    expect(outputLanguage(AUTO, "pt-BR")).toBe("Brazilian Portuguese");
    expect(outputLanguage(undefined, "es")).toBe("Spanish");
  });

  it("falls back to the browser for a stored value that is no longer offered", () => {
    expect(outputLanguage("tlh", "en-US")).toBe("American English");
  });

  it("can be told to keep the video's own language", () => {
    expect(outputLanguage(SOURCE, "pt-BR")).toMatch(/transcript itself/);
  });
});
