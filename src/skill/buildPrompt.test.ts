import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildMessages, stripFrontmatter } from "./buildPrompt.js";

const SKILL = readFileSync(new URL("../../skills/signal-noise/SKILL.md", import.meta.url), "utf8");

describe("stripFrontmatter", () => {
  it("removes the harness-facing frontmatter from the real skill", () => {
    const body = stripFrontmatter(SKILL);
    expect(body.startsWith("# Signal / Noise")).toBe(true);
    expect(body).not.toMatch(/^description:/m);
  });

  it("leaves a skill without frontmatter alone", () => {
    expect(stripFrontmatter("# Skill\n\nbody")).toBe("# Skill\n\nbody");
  });
});

describe("buildMessages", () => {
  const messages = (mode: "complete" | "fast") =>
    buildMessages({ skill: SKILL, transcript: "# Title\n## Transcript\nzebra-sentinel", mode, language: "Portuguese" });

  it("puts the skill in the system message and the transcript in the user message", () => {
    const [system, user] = messages("complete");
    expect(system?.content).toContain("New and relevant are two separate gates");
    expect(system?.content).not.toContain("zebra-sentinel");
    expect(user?.content).toContain("<transcript>\n# Title");
  });

  it("names the mode the way the skill defines it", () => {
    expect(messages("fast")[1]?.content).toMatch(/^Mode: Fast$/m);
    expect(messages("complete")[1]?.content).toMatch(/^Mode: Complete$/m);
    expect(SKILL).toContain("`Mode: Fast`");
  });

  it("asks for the language explicitly, which the skill ranks above everything else", () => {
    expect(messages("fast")[1]?.content).toContain("Write the summary in: Portuguese");
  });
});
