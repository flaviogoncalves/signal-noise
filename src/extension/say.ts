export type Tone = "idle" | "busy" | "good" | "bad";

/** Put a status line on screen, coloured by how it went. */
export function say(target: HTMLElement, message: string, tone: Tone): void {
  target.textContent = message;
  target.className = tone;
}
