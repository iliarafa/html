// Prompt construction for the AI design mode. One system prompt encodes the hard
// rules (complete HTML+CSS document, NO JavaScript, faithful content); the user
// prompt carries either a first-generation request or a refine instruction.

export const MAX_CONTENT_CHARS = 24_000;
export const MAX_INSTRUCTION_CHARS = 2_000;

export const SYSTEM_PROMPT = `You are an award-winning web designer. You output a SINGLE, complete, self-contained HTML document that presents the user's CONTENT beautifully according to their STYLE BRIEF.

Hard rules:
- Return ONE full HTML document: <!DOCTYPE html><html>…</html>. Put ALL CSS in a single <style> in <head>.
- HTML and CSS ONLY. NEVER output <script>, inline event handlers (onclick, onload, …), or javascript: URLs. No JavaScript whatsoever.
- You MAY use external resources to look great: Google Fonts via <link>, and tasteful royalty-free images via absolute https URLs (e.g. https://images.unsplash.com/...) in <img> or CSS background-image.
- Include ALL of the user's content faithfully. Do not invent facts, names, or data. You may reorganize it into sections, a hero, headings, cards, etc.
- Make it genuinely attractive and modern: strong typographic hierarchy, deliberate color, generous spacing, responsive layout, subtle CSS-only motion/gradients where fitting.
- Output ONLY the raw HTML document. No markdown code fences, no explanations.`;

export interface PromptInput {
  content: string;
  brief?: string;
  previousHtml?: string;
  instruction?: string;
}

export interface BuiltPrompt {
  system: string;
  prompt: string;
}

/** Build the system+user prompt for a generation or a refinement. */
export function buildPrompt(input: PromptInput): BuiltPrompt {
  const brief = (input.brief ?? "").trim() || "Clean, modern, and elegant.";

  if (input.previousHtml && input.instruction) {
    return {
      system: SYSTEM_PROMPT,
      prompt: `Here is the current HTML document:

${input.previousHtml}

Apply this change while keeping everything else intact:

"${input.instruction.trim()}"

Return the COMPLETE updated HTML document only.`,
    };
  }

  return {
    system: SYSTEM_PROMPT,
    prompt: `STYLE BRIEF: ${brief}

CONTENT (may be Markdown or plain text):
${input.content.trim()}

Design and return the complete HTML document.`,
  };
}

/** Strip a leading/trailing markdown code fence if the model added one. */
export function stripCodeFences(text: string): string {
  return text
    .replace(/^\s*```(?:html)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}
