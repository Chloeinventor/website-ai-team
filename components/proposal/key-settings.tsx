"use client";

import { useId, useState } from "react";

import { looksLikeApiKey } from "@/lib/demo/proposal/anthropic";
import { clearKey, saveKey } from "@/lib/demo/proposal/key-store";

/**
 * The one place the "runs in your browser" promise gets complicated, so it says
 * so out loud rather than burying it.
 *
 * Without a key everything still works — the heuristic path is the default, not
 * a degraded mode. With a key, the notes go straight from this page to
 * api.anthropic.com and nowhere else.
 */
export function KeySettings({
  activeKey,
  onChange,
}: {
  activeKey: string | null;
  onChange: (key: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();

  function save(event: React.FormEvent) {
    event.preventDefault();
    const value = draft.trim();

    if (!looksLikeApiKey(value)) {
      setError("That doesn't look like an Anthropic key (they start with sk-ant-).");
      return;
    }

    saveKey(value);
    onChange(value);
    setDraft("");
    setError(null);
    setOpen(false);
  }

  function forget() {
    clearKey();
    onChange(null);
    setDraft("");
    setError(null);
  }

  return (
    <div className="mt-4 rounded-node border border-line bg-canvas/60 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm">
          <span
            className={`h-2 w-2 rounded-full ${
              activeKey ? "bg-node-agent" : "bg-line-strong"
            }`}
          />
          <span className="font-medium">
            {activeKey ? "Running on your key" : "Running offline"}
          </span>
          <span className="text-ink-muted">
            {activeKey
              ? "· claude-sonnet-5 reads the notes and writes the follow-ups"
              : "· pattern-matching, no model, no setup"}
          </span>
        </p>

        <div className="flex gap-2">
          {activeKey ? (
            <button type="button" className="btn-ghost btn-sm" onClick={forget}>
              Forget key
            </button>
          ) : null}
          <button
            type="button"
            className="btn-ghost btn-sm"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : activeKey ? "Replace key" : "Use your own API key"}
          </button>
        </div>
      </div>

      {open ? (
        <form onSubmit={save} className="mt-3 border-t border-line pt-3">
          <label htmlFor={fieldId} className="eyebrow">
            Anthropic API key
          </label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <input
              id={fieldId}
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setError(null);
              }}
              placeholder="sk-ant-..."
              className="min-w-0 flex-1 rounded-[10px] border border-line bg-paper px-3 py-2 font-mono text-sm placeholder:text-ink-muted"
            />
            <button type="submit" className="btn-solid btn-sm">
              Save for this tab
            </button>
          </div>

          {error ? (
            <p className="mt-2 text-sm text-node-output">{error}</p>
          ) : null}

          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Held in <code className="font-mono text-[13px]">sessionStorage</code> —
            it dies when you close the tab, and it never reaches my server. The
            request goes from your browser straight to Anthropic. That&apos;s the
            honest caveat on &quot;nothing is sent anywhere&quot;: without a key
            that&apos;s literally true, and with one, the only place your notes go
            is the API you&apos;re paying for.
          </p>
        </form>
      ) : null}
    </div>
  );
}
