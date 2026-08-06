const STORAGE_KEY = "autoworks.anthropic_key";

/**
 * The visitor's own API key, held in `sessionStorage` only.
 *
 * sessionStorage, not localStorage: it dies with the tab. The key never reaches
 * any server of ours — the only request it rides on goes straight from the
 * browser to api.anthropic.com. That is the honest version of "nothing is sent
 * anywhere", and the UI says so in both modes.
 */

export function readKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked outright (private mode, strict settings).
    return null;
  }
}

export function saveKey(key: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, key.trim());
  } catch {
    // Nothing to do — the caller falls back to the heuristic path.
  }
}

export function clearKey(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
