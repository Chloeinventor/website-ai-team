const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escape before interpolation. Both the emailed draft and the printable
 * document are built from text a visitor typed, so nothing goes into markup
 * unescaped — an email rendered from untrusted input is the classic way to turn
 * a demo into someone else's phishing template.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ENTITIES[char]);
}

/** Trim, cap, and escape in one step. Length caps bound the payload we accept. */
export function clampHtml(value: unknown, max: number): string {
  return escapeHtml(String(value ?? "").trim().slice(0, max));
}

/** Same, without escaping — for plain-text bodies. */
export function clampText(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}
