import { languageChoiceFrom } from "../skill/language.js";
export async function loadSettings() {
    const stored = await chrome.storage.local.get(["sippulseKey", "sippulseModel", "mode", "language"]);
    return {
        ...(typeof stored.sippulseKey === "string" ? { apiKey: stored.sippulseKey } : {}),
        ...(typeof stored.sippulseModel === "string" ? { model: stored.sippulseModel } : {}),
        mode: stored.mode === "fast" ? "fast" : "complete",
        language: languageChoiceFrom(stored.language),
    };
}
export const saveKey = (apiKey, model) => chrome.storage.local.set({ sippulseKey: apiKey, sippulseModel: model });
export const saveModel = (model) => chrome.storage.local.set({ sippulseModel: model });
export const removeKey = () => chrome.storage.local.remove(["sippulseKey", "sippulseModel"]);
export const saveMode = (mode) => chrome.storage.local.set({ mode });
export const saveLanguage = (language) => chrome.storage.local.set({ language });
