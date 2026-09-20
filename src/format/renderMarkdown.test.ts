import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./renderMarkdown.js";

describe("renderMarkdown", () => {
  it("renders the blocks a summary is made of", () => {
    const html = renderMarkdown("## Verdict\n\nSkim **two** chapters.\n\n- one\n- two\n\n1. first\n2. second");
    expect(html).toContain("<h2>Verdict</h2>");
    expect(html).toContain("<p>Skim <strong>two</strong> chapters.</p>");
    expect(html).toContain("<ul><li>one</li><li>two</li></ul>");
    expect(html).toContain("<ol><li>first</li><li>second</li></ol>");
  });

  it("turns a chapter anchor into a link without mangling its query string", () => {
    const html = renderMarkdown("up 2x ([25:17 Will AI Kill](https://www.youtube.com/watch?v=5d6y3poKwK4&t=1517s))");
    expect(html).toContain('href="https://www.youtube.com/watch?v=5d6y3poKwK4&amp;t=1517s"');
    expect(html).toContain(">25:17 Will AI Kill</a>");
  });

  it("does not read an underscore or asterisk inside a link or code span as emphasis", () => {
    const html = renderMarkdown("see [a](https://youtu.be/a_b*c_d*e) and `max_tokens*2*x`");
    expect(html).toContain('href="https://youtu.be/a_b*c_d*e"');
    expect(html).toContain("<code>max_tokens*2*x</code>");
  });

  it("escapes markup the model was talked into emitting", () => {
    const html = renderMarkdown('<img src=x onerror="alert(1)"> and <script>steal()</script>');
    expect(html).not.toMatch(/<img|<script/);
    expect(html).toContain("&lt;img");
  });

  it("refuses a link that is not http(s)", () => {
    const html = renderMarkdown("[click](javascript:alert(1)) [data](data:text/html,x)");
    expect(html).not.toContain("<a ");
  });

  it("cannot be broken out of an href with a quote", () => {
    const html = renderMarkdown('[x](https://a.test/"onmouseover="alert(1))');
    expect(html).not.toMatch(/"onmouseover/);
  });

  it("renders a table of thresholds", () => {
    const html = renderMarkdown("| Tier | Price |\n|---|---|\n| Mid | $49.90 |");
    expect(html).toContain("<th>Tier</th><th>Price</th>");
    expect(html).toContain("<td>Mid</td><td>$49.90</td>");
  });

  it("renders a half-streamed summary without throwing", () => {
    expect(() => renderMarkdown("## What is new\n\nStripe **disclosed [25:17](https://www.you")).not.toThrow();
  });

  it("keeps a wrapped bullet as one item and a quote as a quote", () => {
    expect(renderMarkdown("- first line\n  continues\n- second")).toContain("<li>first line continues</li>");
    expect(renderMarkdown("> quoted *verbatim*")).toContain("<blockquote><p>quoted <em>verbatim</em></p></blockquote>");
  });
});
