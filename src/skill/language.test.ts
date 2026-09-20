import { describe, expect, it } from "vitest";
import { AUTO, languageChoiceFrom, outputLanguage, SOURCE } from "./language.js";

describe("outputLanguage", () => {
  it("names the language that was picked, whatever the browser speaks", () => {
    expect(outputLanguage("pt-BR", "en-US")).toBe("Brazilian Portuguese");
    expect(outputLanguage("en", "pt-BR")).toBe("English");
  });

  it("follows the browser when left on auto", () => {
    expect(outputLanguage(AUTO, "pt-BR")).toBe("Brazilian Portuguese");
    expect(outputLanguage(AUTO, "es")).toBe("Spanish");
  });

  it("can be told to keep the video's own language", () => {
    expect(outputLanguage(SOURCE, "pt-BR")).toMatch(/transcript itself/);
  });
});

describe("languageChoiceFrom", () => {
  it("reads back what was stored", () => {
    expect(languageChoiceFrom("pt-BR")).toBe("pt-BR");
    expect(languageChoiceFrom(SOURCE)).toBe(SOURCE);
  });

  it("falls back to auto when nothing was stored, or what was stored is no longer offered", () => {
    expect(languageChoiceFrom(undefined)).toBe(AUTO);
    expect(languageChoiceFrom("tlh")).toBe(AUTO);
    expect(languageChoiceFrom(42)).toBe(AUTO);
  });
});
