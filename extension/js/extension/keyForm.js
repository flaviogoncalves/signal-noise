import { listModels, ModelUnavailableError, resolveModel, SipPulseError } from "../sippulse/client.js";
import { say } from "./say.js";
import { removeKey, saveKey } from "./settings.js";
const $ = (id) => document.getElementById(id);
/**
 * The Settings section: the one thing the user configures.
 * Returns a way for the rest of the panel to send the user here when a key is missing.
 */
export function setUpKeyForm(stored, onSaved) {
    const section = $("settings");
    const input = $("key");
    const saveButton = $("save-key");
    const removeButton = $("remove-key");
    const status = $("key-status");
    const askForKey = () => {
        section.open = true;
        input.focus();
    };
    saveButton.addEventListener("click", async () => {
        const key = input.value.trim();
        if (!key) {
            say(status, "Paste a key first. To stop using one, click Remove key.", "bad");
            return;
        }
        saveButton.disabled = true;
        say(status, "Checking the key…", "busy");
        try {
            // Listing the models proves, in one request, that the key works and can run an evaluation.
            resolveModel(await listModels(key));
            await saveKey(key);
            say(status, "Key saved.", "good");
            removeButton.hidden = false;
            section.open = false;
            onSaved();
        }
        catch (error) {
            if (error instanceof ModelUnavailableError)
                console.info("Models this key can use:", error.seen);
            // The key that was already saved, if any, is left alone.
            say(status, error instanceof SipPulseError ? error.message : `Could not reach SipPulse AI: ${String(error)}`, "bad");
        }
        finally {
            saveButton.disabled = false;
        }
    });
    removeButton.addEventListener("click", async () => {
        await removeKey();
        input.value = "";
        removeButton.hidden = true;
        say(status, "Key removed from this browser.", "idle");
    });
    if (stored.apiKey) {
        input.value = stored.apiKey;
        removeButton.hidden = false;
    }
    else {
        section.open = true;
    }
    return { askForKey };
}
