/** Put a status line on screen, coloured by how it went. */
export function say(target, message, tone) {
    target.textContent = message;
    target.className = tone;
}
