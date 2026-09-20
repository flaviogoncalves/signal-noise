import { languageChoiceFrom } from "../skill/language.js";
export async function loadSettings() {
    const stored = await chrome.storage.local.get(["sippulseKey", "mode", "language"]);
    return {
        ...(typeof stored.sippulseKey === "string" ? { apiKey: stored.sippulseKey } : {}),
        mode: stored.mode === "fast" ? "fast" : "complete",
        language: languageChoiceFrom(stored.language),
    };
}
// `sippulseModel` was written by 0.4.0 and 0.4.1, which displayed the model's id. Nothing
// reads it now, so saving or removing a key clears what an upgraded install still holds.
export const saveKey = async (apiKey) => {
    await chrome.storage.local.set({ sippulseKey: apiKey });
    await chrome.storage.local.remove("sippulseModel");
};
export const removeKey = () => chrome.storage.local.remove(["sippulseKey", "sippulseModel"]);
export const saveMode = (mode) => chrome.storage.local.set({ mode });
export const saveLanguage = (language) => chrome.storage.local.set({ language });
