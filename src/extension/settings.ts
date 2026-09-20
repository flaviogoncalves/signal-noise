import type { Mode } from "../skill/buildPrompt.js";
import { languageChoiceFrom, type LanguageChoice } from "../skill/language.js";

declare const chrome: any;

/**
 * Everything the extension remembers. Kept in `storage.local` — this browser
 * only — because `storage.sync` would copy the key to the user's Google account.
 */
export interface Settings {
  apiKey?: string;
  mode: Mode;
  language: LanguageChoice;
}

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(["sippulseKey", "mode", "language"]);
  return {
    ...(typeof stored.sippulseKey === "string" ? { apiKey: stored.sippulseKey } : {}),
    mode: stored.mode === "fast" ? "fast" : "complete",
    language: languageChoiceFrom(stored.language),
  };
}

// `sippulseModel` was written by 0.4.0 and 0.4.1, which displayed the model's id. Nothing
// reads it now, so saving or removing a key clears what an upgraded install still holds.
export const saveKey = async (apiKey: string): Promise<void> => {
  await chrome.storage.local.set({ sippulseKey: apiKey });
  await chrome.storage.local.remove("sippulseModel");
};

export const removeKey = (): Promise<void> => chrome.storage.local.remove(["sippulseKey", "sippulseModel"]);

export const saveMode = (mode: Mode): Promise<void> => chrome.storage.local.set({ mode });

export const saveLanguage = (language: LanguageChoice): Promise<void> => chrome.storage.local.set({ language });
