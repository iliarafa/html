// Theme: produces the CSS string embedded in the output file. Composes three
// independent axes — color scheme (light/dark accent), font pairing, and density —
// into CSS custom properties, plus the base element styles and block/interaction
// styling shared by all layout templates. Light + dark palettes are both present,
// keyed on a [data-theme] attribute, so the in-file toggle switches without re-render.

import {
  COLOR_SCHEMES,
  FONT_PAIRINGS,
  type ColorSchemeKey,
  type Density,
  type FontPairingKey,
  type ThemeConfig,
} from "./types";

function scheme(key: ColorSchemeKey) {
  return COLOR_SCHEMES.find((s) => s.key === key) ?? COLOR_SCHEMES[0];
}
function font(key: FontPairingKey) {
  return FONT_PAIRINGS.find((f) => f.key === key) ?? FONT_PAIRINGS[0];
}

function densityVars(d: Density): string {
  return d === "compact"
    ? `--base-size: 15px; --line: 1.55; --space: 0.85; --measure: 680px;`
    : `--base-size: 17px; --line: 1.7; --space: 1; --measure: 720px;`;
}

/** Build the full stylesheet for the output document from a theme config. */
export function buildThemeCss(theme: ThemeConfig): string {
  const a = scheme(theme.scheme);
  const f = font(theme.font);
  return `
:root {
  --font-heading: ${f.heading};
  --font-body: ${f.body};
  --font-mono: ${f.mono};
  ${densityVars(theme.density)}
}
:root[data-theme="light"] {
  --bg: #fafafa; --surface: #ffffff; --text: #18181b; --muted: #71717a;
  --border: #e4e4e7; --accent: ${a.light}; --accent-soft: color-mix(in srgb, ${a.light} 12%, transparent);
  --code-bg: #f4f4f5; --code-border: #e4e4e7;
  --hl-keyword: #a855f7; --hl-string: #16a34a; --hl-number: #c2410c;
  --hl-comment: #71717a; --hl-title: #2563eb; --hl-attr: #0369a1;
  --hl-built: #0891b2; --hl-literal: #a855f7; --hl-meta: #71717a;
}
:root[data-theme="dark"] {
  --bg: #0b0d12; --surface: #11141b; --text: #f4f4f5; --muted: #9ca3af;
  --border: #232936; --accent: ${a.dark}; --accent-soft: color-mix(in srgb, ${a.dark} 18%, transparent);
  --code-bg: #0b0d12; --code-border: #232936;
  --hl-keyword: #c084fc; --hl-string: #4ade80; --hl-number: #fdba74;
  --hl-comment: #7d8590; --hl-title: #7dd3fc; --hl-attr: #7dd3fc;
  --hl-built: #67e8f9; --hl-literal: #c084fc; --hl-meta: #9ca3af;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg); color: var(--text);
  font-family: var(--font-body); line-height: var(--line); font-size: var(--base-size);
  -webkit-font-smoothing: antialiased;
}
.eyebrow { color: var(--accent); font-size: 13px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
h1.doc-title { font-family: var(--font-heading); font-size: 34px; font-weight: 700; letter-spacing: -.02em; margin: 10px 0 4px; line-height: 1.2; }
.doc-subtitle { color: var(--muted); font-size: 19px; margin: 0 0 14px; }
.doc-meta { color: var(--muted); font-size: 14px; margin: 0 0 8px; }
.doc-divider { border: none; border-top: 1px solid var(--border); margin: 24px 0 40px; }
.content { font-family: var(--font-body); }
.content h1, .content h2, .content h3, .content h4 { font-family: var(--font-heading); letter-spacing: -.01em; line-height: 1.3; margin: calc(1.8em * var(--space)) 0 .6em; scroll-margin-top: 1em; }
.content h1 { font-size: 27px; } .content h2 { font-size: 22px; } .content h3 { font-size: 19px; }
.content p { margin: 0 0 calc(1.1em * var(--space)); }
.content a { color: var(--accent); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); }
.content a:hover { border-bottom-color: var(--accent); }
.content ul, .content ol { padding-left: 1.4em; margin: 0 0 calc(1.1em * var(--space)); }
.content li { margin: .3em 0; }
.content blockquote { margin: 1.2em 0; padding: .2em 1em; border-left: 3px solid var(--accent); color: var(--muted); }
.content hr, .block-divider { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
.content table { border-collapse: collapse; width: 100%; margin: 1.2em 0; font-size: 15px; }
.content th, .content td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
.content th { background: var(--code-bg); }
.content code { font-family: var(--font-mono); font-size: .9em; }
.content :not(pre) > code { background: var(--code-bg); border: 1px solid var(--code-border); border-radius: 5px; padding: .12em .4em; }
.content pre { background: var(--code-bg); border: 1px solid var(--code-border); border-radius: 10px; padding: 16px 18px; overflow-x: auto; margin: 1.2em 0; }
.content pre code { font-size: 14px; line-height: 1.6; }
.content img { max-width: 100%; height: auto; border-radius: 8px; }
/* blocks */
.callout { display: flex; gap: 10px; margin: 1.4em 0; padding: 14px 16px; border-radius: 10px; border: 1px solid var(--border); background: var(--accent-soft); border-left: 3px solid var(--accent); }
.callout[data-variant="warn"] { --accent: #d97706; } .callout[data-variant="danger"] { --accent: #dc2626; } .callout[data-variant="success"] { --accent: #16a34a; }
.callout > * { margin: 0; } .callout p + p { margin-top: .5em; }
.quote-card { margin: 1.6em 0; padding: 20px 24px; border-radius: 12px; background: var(--code-bg); border: 1px solid var(--border); }
.quote-card blockquote { border: none; margin: 0; padding: 0; font-size: 1.15em; color: var(--text); }
.quote-card figcaption { margin-top: 10px; color: var(--muted); font-size: .9em; }
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 1.4em 0; }
.columns .col > :first-child { margin-top: 0; }
.figure { margin: 1.6em 0; } .figure img { display: block; width: 100%; }
.figure figcaption { margin-top: 8px; color: var(--muted); font-size: .9em; text-align: center; }
.collapsible { margin: 1.2em 0; border: 1px solid var(--border); border-radius: 10px; padding: 0 16px; }
.collapsible > summary { cursor: pointer; font-weight: 600; padding: 12px 0; }
.collapsible[open] > summary { border-bottom: 1px solid var(--border); margin-bottom: 12px; }
.collapsible-body { padding-bottom: 12px; }
.collapsible-body > :first-child { margin-top: 0; }
/* tabs */
.tabs { margin: 1.4em 0; }
.tabs .tablist { display: flex; gap: 4px; border-bottom: 1px solid var(--border); }
.tabs .tab { font: inherit; font-size: 14px; font-weight: 500; background: none; border: none; border-bottom: 2px solid transparent; color: var(--muted); padding: 8px 14px; cursor: pointer; margin-bottom: -1px; }
.tabs .tab[aria-selected="true"] { color: var(--accent); border-bottom-color: var(--accent); }
.tabs .tabpanel { padding-top: 16px; } .tabs .tabpanel[hidden] { display: none; }
.tabs .tabpanel > :first-child { margin-top: 0; }
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
  font-family: inherit; z-index: 10; }
.theme-toggle:hover { color: var(--text); }
`.trim();
}
