// Serializer: the OUT path. Takes the editor's raw HTML (editor.getHTML()) and
// produces final, self-contained content HTML for the builder. It highlights code,
// slugs headings (for the TOC), expands tab blocks into their final interactive
// markup, and sanitizes the result. Pure / framework-free — operates on the DOM via
// DOMParser (available in the browser and in jsdom tests).

import { highlightCode } from "../highlight";
import { sanitize } from "../parser";
import type { Heading } from "../types";

export interface SerializeResult {
  html: string;
  usesTabs: boolean;
  headings: Heading[];
}

function slugify(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

/** Highlight every <pre><code> in place. */
function highlightAll(root: ParentNode): void {
  root.querySelectorAll("pre > code").forEach((code) => {
    const langClass = Array.from(code.classList).find((c) => c.startsWith("language-"));
    const lang = langClass?.replace("language-", "");
    const { value, language } = highlightCode(code.textContent ?? "", lang);
    code.innerHTML = value;
    code.className = "hljs" + (language ? ` language-${language}` : "");
  });
}

/** Assign ids to headings and collect them for a table of contents. */
function collectHeadings(root: ParentNode): Heading[] {
  const used = new Set<string>();
  const headings: Heading[] = [];
  root.querySelectorAll("h1, h2, h3, h4").forEach((el) => {
    const text = el.textContent?.trim() ?? "";
    if (!text) return;
    const id = el.id || slugify(text, used);
    el.id = id;
    headings.push({ id, text, level: Number(el.tagName[1]) });
  });
  return headings;
}

/**
 * Expand each `.tabs[data-tabs]` from the editor's flat panel list into the final
 * markup: a generated tablist of buttons + a tabpanels group, first tab active.
 */
function expandTabs(doc: Document, root: ParentNode): boolean {
  const tabsEls = Array.from(root.querySelectorAll(".tabs[data-tabs]"));
  for (const tabs of tabsEls) {
    const panels = Array.from(tabs.querySelectorAll(":scope > .tabpanel"));
    if (!panels.length) continue;

    const tablist = doc.createElement("div");
    tablist.className = "tablist";
    tablist.setAttribute("role", "tablist");

    const panelGroup = doc.createElement("div");
    panelGroup.className = "tabpanels";

    panels.forEach((panel, i) => {
      const label = panel.getAttribute("data-label") || `Tab ${i + 1}`;
      const btn = doc.createElement("button");
      btn.className = "tab";
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.textContent = label;
      tablist.appendChild(btn);

      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-label", label);
      if (i !== 0) panel.setAttribute("hidden", "");
      panelGroup.appendChild(panel);
    });

    tabs.replaceChildren(tablist, panelGroup);
  }
  return tabsEls.length > 0;
}

/** Serialize editor HTML into final content HTML for the builder. */
export function serializeContent(editorHtml: string): SerializeResult {
  const doc = new DOMParser().parseFromString(`<body>${editorHtml}</body>`, "text/html");
  const root = doc.body;

  highlightAll(root);
  const headings = collectHeadings(root);
  const usesTabs = expandTabs(doc, root);

  const html = sanitize(root.innerHTML);
  return { html, usesTabs, headings };
}
