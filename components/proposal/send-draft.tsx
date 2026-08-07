"use client";

import { useId, useState } from "react";

import type { ProposalRun } from "@/lib/demo/proposal/types";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string; code?: string };

/**
 * Mails the drafted proposal to one address. The route does the real work — this
 * only collects an address and reports back honestly, including the case where
 * the deployment has no RESEND_API_KEY and the answer is "this isn't wired up".
 */
export function SendDraft({ run }: { run: ProposalRun }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const fieldId = useId();

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setState({ kind: "sending" });

    try {
      const res = await fetch("/api/send-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, run }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setState({
          kind: "error",
          message: body?.error ?? "That didn't send.",
          code: body?.code,
        });
        return;
      }

      setState({ kind: "sent", email });
      setEmail("");
    } catch {
      setState({ kind: "error", message: "Couldn't reach the server." });
    }
  }

  if (state.kind === "sent") {
    return (
      <div className="rounded-node border border-node-action/35 bg-node-action/[0.06] px-4 py-3">
        <p className="text-sm">
          <span className="font-medium">Sent to {state.email}.</span>{" "}
          <span className="text-ink-soft">
            Check spam if it&apos;s not there in a minute — it&apos;s a first
            email from a new domain.
          </span>
        </p>
        <button
          type="button"
          className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted underline underline-offset-4 hover:text-ink"
          onClick={() => setState({ kind: "idle" })}
        >
          send another
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="btn-ghost btn-sm" onClick={() => setOpen(true)}>
        Email this to me
      </button>
    );
  }

  return (
    <form onSubmit={send} className="w-full">
      <label htmlFor={fieldId} className="eyebrow">
        Send the draft to
      </label>
      <div className="mt-1.5 flex flex-wrap gap-2">
        <input
          id={fieldId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state.kind === "error") setState({ kind: "idle" });
          }}
          placeholder="you@company.com"
          className="min-w-0 flex-1 rounded-[10px] border border-line bg-paper px-3 py-2 text-sm placeholder:text-ink-muted"
        />
        <button
          type="submit"
          className="btn-solid btn-sm"
          disabled={state.kind === "sending"}
        >
          {state.kind === "sending" ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          className="btn-ghost btn-sm"
          onClick={() => {
            setOpen(false);
            setState({ kind: "idle" });
          }}
        >
          Cancel
        </button>
      </div>

      {state.kind === "error" ? (
        <p className="mt-2 text-sm text-node-output">
          {state.message}
          {state.code === "not_configured" ? (
            <span className="mt-1 block text-ink-muted">
              The draft is still on screen, and the PDF still works.
            </span>
          ) : null}
        </p>
      ) : (
        <p className="mt-2 text-sm text-ink-muted">
          One email, sent once. Your address is used for this send and
          isn&apos;t stored or subscribed to anything.
        </p>
      )}
    </form>
  );
}
