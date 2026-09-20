/**
 * Render the subset of Markdown a summary uses, as HTML. Pure.
 *
 * The input is model output over a stranger's transcript, so it is hostile
 * until proven otherwise: everything is escaped before any markup is added,
 * and the only attribute whose value comes from the input is an `href`, which
 * must be http(s). Every other attribute written is a constant.
 */
export function renderMarkdown(markdown) {
    const lines = markdown.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").split("\n");
    const html = [];
    let paragraph = [];
    let list;
    let quote = [];
    const flush = () => {
        if (paragraph.length)
            html.push(`<p>${inline(paragraph.join(" "))}</p>`);
        if (list)
            html.push(`<${list.tag}>${list.items.map((item) => `<li>${inline(item)}</li>`).join("")}</${list.tag}>`);
        if (quote.length)
            html.push(`<blockquote>${renderMarkdown(quote.join("\n"))}</blockquote>`);
        paragraph = [];
        list = undefined;
        quote = [];
    };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s*```/.test(line)) {
            // A fence still open when the text ends is a half-streamed block: render what there is.
            flush();
            const code = [];
            for (i++; i < lines.length && !/^\s*```\s*$/.test(lines[i]); i++)
                code.push(lines[i]);
            html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
            continue;
        }
        const heading = /^(#{1,6})\s+(.*)$/.exec(line);
        const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
        const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
        const quoted = /^>\s?(.*)$/.exec(line);
        if (line.trim() === "") {
            flush();
        }
        else if (heading) {
            flush();
            const level = heading[1].length;
            html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
        }
        else if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
            flush();
            html.push("<hr>");
        }
        else if (isTableRow(line) && isTableDivider(lines[i + 1])) {
            flush();
            const rows = [];
            for (i += 2; i < lines.length && isTableRow(lines[i]); i++)
                rows.push(lines[i]);
            i--;
            html.push(table(line, rows));
        }
        else if (bullet || numbered) {
            const tag = bullet ? "ul" : "ol";
            if (list?.tag !== tag)
                flush();
            list ??= { tag, items: [] };
            list.items.push((bullet ?? numbered)[1]);
        }
        else if (quoted) {
            if (paragraph.length || list)
                flush();
            quote.push(quoted[1]);
        }
        else if (list && /^\s+\S/.test(line)) {
            // An indented line under a bullet continues it.
            list.items[list.items.length - 1] += ` ${line.trim()}`;
        }
        else {
            if (list || quote.length)
                flush();
            paragraph.push(line.trim());
        }
    }
    flush();
    return html.join("\n");
}
const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
const isTableDivider = (line) => line !== undefined && /^\s*\|(\s*:?-+:?\s*\|)+\s*$/.test(line);
const cells = (row) => row.trim().slice(1, -1).split("|").map((cell) => cell.trim());
function table(head, rows) {
    const th = cells(head).map((cell) => `<th>${inline(cell)}</th>`).join("");
    const body = rows
        .map((row) => `<tr>${cells(row).map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
        .join("");
    return `<table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`;
}
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
const emphasis = (text) => text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>");
/**
 * Code spans and links are lifted out before emphasis runs, so an asterisk or
 * underscore inside a URL or a flag name is never read as markup.
 */
function inline(text) {
    const held = [];
    const hold = (html) => `\u0000${held.push(html) - 1}\u0000`;
    const escaped = escapeHtml(text)
        .replace(/`([^`]+)`/g, (_, code) => hold(`<code>${code}</code>`))
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, label, href) => /^https?:\/\//i.test(href)
        ? hold(`<a href="${href}" target="_blank" rel="noopener noreferrer">${emphasis(label)}</a>`)
        : whole);
    // A link's label can itself hold a code span, so a restored item may carry a marker of its own.
    let html = emphasis(escaped);
    for (let pass = 0; pass <= held.length && html.includes("\u0000"); pass++) {
        html = html.replace(/\u0000(\d+)\u0000/g, (_, index) => held[Number(index)] ?? "");
    }
    return html;
}
