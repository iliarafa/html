// Shared syntax-highlighting helper. Used by the markdown importer (seed) and by
// the serializer (final output) so highlighting logic lives in exactly one place.

import hljs from "highlight.js";

export interface Highlighted {
  /** Highlighted inner HTML (hljs token spans). */
  value: string;
  /** Resolved language, if a registered one was detected/requested. */
  language?: string;
}

/** Highlight a code string. Uses the given language when registered, else auto-detect. */
export function highlightCode(text: string, lang?: string): Highlighted {
  const language = lang && hljs.getLanguage(lang) ? lang : undefined;
  if (language) {
    return { value: hljs.highlight(text, { language }).value, language };
  }
  return { value: hljs.highlightAuto(text).value };
}
