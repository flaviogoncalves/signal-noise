// The extension applies the same skill file an agent would load. Copying it at
// build time keeps one source of truth: edit skills/, rebuild, and both change.
import { cpSync } from "node:fs";

cpSync("skills/signal-noise/SKILL.md", "extension/skill/SKILL.md");
