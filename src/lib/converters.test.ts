import { textToHtml, markdownToHtml, titleFromFilename } from "./converters";

describe("textToHtml", () => {
  it("wraps each non-empty line in a <p> tag", () => {
    const result = textToHtml("Hello\nWorld");
    expect(result).toBe("<p>Hello</p><p>World</p>");
  });

  it("converts empty lines to empty <p> tags", () => {
    const result = textToHtml("Line 1\n\nLine 2");
    expect(result).toBe("<p>Line 1</p><p></p><p>Line 2</p>");
  });

  it("escapes HTML special characters", () => {
    const result = textToHtml("5 < 10 & 3 > 2");
    expect(result).toBe("<p>5 &lt; 10 &amp; 3 &gt; 2</p>");
  });

  it("handles a single line with no newlines", () => {
    expect(textToHtml("Hello world")).toBe("<p>Hello world</p>");
  });
});

describe("markdownToHtml", () => {
  it("converts # heading to <h1>", () => {
    expect(markdownToHtml("# Hello")).toContain("<h1>Hello</h1>");
  });

  it("converts ## heading to <h2>", () => {
    expect(markdownToHtml("## Section")).toContain("<h2>Section</h2>");
  });

  it("converts ### heading to <h3>", () => {
    expect(markdownToHtml("### Sub")).toContain("<h3>Sub</h3>");
  });

  it("converts **text** to <strong>", () => {
    expect(markdownToHtml("**bold**")).toContain("<strong>bold</strong>");
  });

  it("converts *text* to <em>", () => {
    expect(markdownToHtml("*italic*")).toContain("<em>italic</em>");
  });

  it("converts _text_ to <em>", () => {
    expect(markdownToHtml("_italic_")).toContain("<em>italic</em>");
  });

  it("converts ***text*** to <strong><em>", () => {
    expect(markdownToHtml("***bold italic***")).toContain(
      "<strong><em>bold italic</em></strong>"
    );
  });

  it("wraps bullet list items in <ul>", () => {
    const result = markdownToHtml("- Item 1\n- Item 2");
    expect(result).toContain("<ul>");
    expect(result).toContain("<li>Item 1</li>");
    expect(result).toContain("<li>Item 2</li>");
  });

  it("escapes HTML in markdown content", () => {
    const result = markdownToHtml("A & B");
    expect(result).toContain("&amp;");
  });

  it("does not double-wrap headings as paragraphs", () => {
    const result = markdownToHtml("# Title");
    expect(result).not.toContain("<p><h1>");
    expect(result).toContain("<h1>Title</h1>");
  });
});

describe("titleFromFilename", () => {
  it("strips .txt extension", () => {
    expect(titleFromFilename("my-notes.txt")).toBe("my notes");
  });

  it("strips .md extension", () => {
    expect(titleFromFilename("project-plan.md")).toBe("project plan");
  });

  it("strips .markdown extension", () => {
    expect(titleFromFilename("README.markdown")).toBe("README");
  });

  it("replaces underscores with spaces", () => {
    expect(titleFromFilename("meeting_notes.txt")).toBe("meeting notes");
  });

  it("falls back to 'Uploaded Document' for empty result", () => {
    expect(titleFromFilename(".txt")).toBe("Uploaded Document");
  });
});
