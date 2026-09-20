import type { Mode } from "../skill/buildPrompt.js";
import { languageChoiceFrom, type LanguageChoice } from "../skill/language.js";

declare const chrome: any;

/**
 * Everything the extension remembers. Kept in `storage.local` — this browser
 * only — because `storage.sync` would copy the key to the user's Google account.
 */
export interface Settings {
  apiKey?: string;
  /** The model the key last resolved to. For display: it is resolved again on every evaluation. */
  model?: string;
  mode: Mode;
  language: LanguageChoice;
}

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(["sippulseKey", "sippulseModel", "mode", "language"]);
  return {
    ...(typeof stored.sippulseKey === "string" ? { apiKey: stored.sippulseKey } : {}),
    ...(typeof stored.sippulseModel === "string" ? { model: stored.sippulseModel } : {}),
    mode: stored.mode === "fast" ? "fast" : "complete",
    language: languageChoiceFrom(stored.language),
  };
}

export const saveKey = (apiKey: string, model: string): Promise<void> =>
  chrome.storage.local.set({ sippulseKey: apiKey, sippulseModel: model });

export const saveModel = (model: string): Promise<void> => chrome.storage.local.set({ sippulseModel: model });

export const removeKey = (): Promise<void> => chrome.storage.local.remove(["sippulseKey", "sippulseModel"]);

export const saveMode = (mode: Mode): Promise<void> => chrome.storage.local.set({ mode });

export const saveLanguage = (language: LanguageChoice): Promise<void> => chrome.storage.local.set({ language });
