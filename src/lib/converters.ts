export function textToHtml(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return escaped ? `<p>${escaped}</p>` : "<p></p>";
    })
    .join("");
}

export function markdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings (must come before inline formatting)
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold+italic, then bold, then italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Unordered list items → wrap contiguous runs in <ul>
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Ordered list items (numbers already consumed above since they don't match `- `)
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Wrap plain lines as paragraphs
  html = html
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (
        !t ||
        t.startsWith("<h") ||
        t.startsWith("<ul") ||
        t.startsWith("<li") ||
        t.startsWith("<ol")
      ) {
        return t;
      }
      return `<p>${t}</p>`;
    })
    .join("");

  return html;
}

export function titleFromFilename(filename: string): string {
  return (
    filename
      .replace(/\.(txt|md|markdown)$/i, "")
      .replace(/[-_]/g, " ")
      .trim() || "Uploaded Document"
  );
}
