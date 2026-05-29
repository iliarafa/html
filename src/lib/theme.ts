// Theme: produces the CSS string embedded in the output file. One hybrid theme
// (clean / modern / code-friendly) with light + dark palettes keyed on a
// [data-theme] attribute, plus a chosen accent color. Both palettes are always
// present so the in-file light/dark toggle can switch without re-rendering.

import type { AccentKey } from "./types";

const ACCENT_PAIRS: Record<AccentKey, { light: string; dark: string }> = {
  indigo: { light: "#6366f1", dark: "#818cf8" },
  emerald: { light: "#10b981", dark: "#34d399" },
  rose: { light: "#f43f5e", dark: "#fb7185" },
  amber: { light: "#d97706", dark: "#fbbf24" },
  slate: { light: "#475569", dark: "#94a3b8" },
};

/** Build the full stylesheet for the output document. */
export function buildThemeCss(accent: AccentKey): string {
  const a = ACCENT_PAIRS[accent];
  return `
:root[data-theme="light"] {
  --bg: #fafafa; --surface: #ffffff; --text: #18181b; --muted: #71717a;
  --border: #e4e4e7; --accent: ${a.light}; --code-bg: #f4f4f5; --code-border: #e4e4e7;
  --hl-keyword: #a855f7; --hl-string: #16a34a; --hl-number: #c2410c;
  --hl-comment: #71717a; --hl-title: #2563eb; --hl-attr: #0369a1;
  --hl-built: #0891b2; --hl-literal: #a855f7; --hl-meta: #71717a;
}
:root[data-theme="dark"] {
  --bg: #0b0d12; --surface: #11141b; --text: #f4f4f5; --muted: #9ca3af;
  --border: #232936; --accent: ${a.dark}; --code-bg: #0b0d12; --code-border: #232936;
  --hl-keyword: #c084fc; --hl-string: #4ade80; --hl-number: #fdba74;
  --hl-comment: #7d8590; --hl-title: #7dd3fc; --hl-attr: #7dd3fc;
  --hl-built: #67e8f9; --hl-literal: #c084fc; --hl-meta: #9ca3af;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg); color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.7; font-size: 17px;
  -webkit-font-smoothing: antialiased;
}
.page { max-width: 720px; margin: 0 auto; padding: 64px 24px 96px; }
.eyebrow { color: var(--accent); font-size: 13px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
h1.doc-title { font-size: 34px; font-weight: 700; letter-spacing: -.02em; margin: 10px 0 4px; line-height: 1.2; }
.doc-subtitle { color: var(--muted); font-size: 19px; margin: 0 0 14px; }
.doc-meta { color: var(--muted); font-size: 14px; margin: 0 0 8px; }
.doc-divider { border: none; border-top: 1px solid var(--border); margin: 24px 0 40px; }
.content h1, .content h2, .content h3, .content h4 { letter-spacing: -.01em; line-height: 1.3; margin: 1.8em 0 .6em; }
.content h1 { font-size: 27px; } .content h2 { font-size: 22px; } .content h3 { font-size: 19px; }
.content p { margin: 0 0 1.1em; }
.content a { color: var(--accent); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); }
.content a:hover { border-bottom-color: var(--accent); }
.content ul, .content ol { padding-left: 1.4em; margin: 0 0 1.1em; }
.content li { margin: .3em 0; }
.content blockquote { margin: 1.2em 0; padding: .2em 1em; border-left: 3px solid var(--accent); color: var(--muted); }
.content hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
.content table { border-collapse: collapse; width: 100%; margin: 1.2em 0; font-size: 15px; }
.content th, .content td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
.content th { background: var(--code-bg); }
.content code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; font-size: .9em; }
.content :not(pre) > code { background: var(--code-bg); border: 1px solid var(--code-border); border-radius: 5px; padding: .12em .4em; }
.content pre { background: var(--code-bg); border: 1px solid var(--code-border); border-radius: 10px; padding: 16px 18px; overflow-x: auto; margin: 1.2em 0; }
.content pre code { font-size: 14px; line-height: 1.6; }
/* highlight.js token colors (inlined, theme-aware) */
.hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: var(--hl-keyword); }
.hljs-string, .hljs-regexp, .hljs-addition { color: var(--hl-string); }
.hljs-number, .hljs-symbol, .hljs-bullet { color: var(--hl-number); }
.hljs-comment, .hljs-quote { color: var(--hl-comment); font-style: italic; }
.hljs-title, .hljs-section, .hljs-name { color: var(--hl-title); }
.hljs-attr, .hljs-attribute, .hljs-variable, .hljs-template-variable { color: var(--hl-attr); }
.hljs-type, .hljs-class .hljs-title, .hljs-params { color: var(--hl-built); }
.hljs-literal, .hljs-meta { color: var(--hl-literal); }
.hljs-emphasis { font-style: italic; } .hljs-strong { font-weight: 700; }
/* theme toggle button (only present when enabled) */
.theme-toggle { position: fixed; top: 18px; right: 18px; background: var(--surface); color: var(--muted);
  border: 1px solid var(--border); border-radius: 999px; padding: 7px 14px; font-size: 13px; cursor: pointer;
  font-family: inherit; }
.theme-toggle:hover { color: var(--text); }
`.trim();
}
