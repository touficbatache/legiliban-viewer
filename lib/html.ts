// Crawled text is untrusted: escape it before it is rendered as HTML.
export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// FTS5 marks matches with these control characters (see searchRecords) so the
// snippet can be escaped first and only then turned into <mark> tags.
export const SNIPPET_OPEN = "\u0001";
export const SNIPPET_CLOSE = "\u0002";

export function snippetToHtml(snippet: string) {
  return escapeHtml(snippet)
    .split(SNIPPET_OPEN).join("<mark>")
    .split(SNIPPET_CLOSE).join("</mark>");
}
