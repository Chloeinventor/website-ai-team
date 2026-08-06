"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  PROMPT_EXAMPLES,
  simulate,
  type RunOutput,
  type RunStep,
} from "@/lib/demo/simulate";
import { NODE_COLOR } from "@/lib/node-colors";
import type { DemoKind, Product } from "@/lib/products";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * The try-it surface. Type a real scenario, watch the workflow run on it.
 *
 * Nothing here is a video and nothing is a signup: `simulate()` runs in the
 * browser against whatever the visitor typed. See lib/demo/simulate.ts for the
 * honest description of what's simulated and what a v2 would replace.
 */
export function DemoRunner({
  product,
  variant = "inline",
  onBuy,
  onInputChange,
  statusSlot,
  execute,
  renderResult,
  footerNote,
}: {
  product: Product;
  variant?: "inline" | "modal";
  onBuy?: () => void;
  /** Fires on every edit, including example loads — lets a wrapper watch the notes. */
  onInputChange?: (value: string) => void;
  /** Rendered opposite the field label. The Proposal Builder puts its fit pill here. */
  statusSlot?: React.ReactNode;
  /**
   * Async replacement for the built-in `simulate()`. When present, the node
   * list plays as a skeleton from `product.steps` while the promise is in
   * flight, then swaps to the real steps the run reports.
   */
  execute?: (input: string, signal: AbortSignal) => Promise<RunOutput>;
  /** Replaces the generic result card — for products with a real artifact. */
  renderResult?: (output: RunOutput) => React.ReactNode;
  /** Overrides the line under the field. Must stay true in both run modes. */
  footerNote?: React.ReactNode;
}) {
  const kind: DemoKind = product.demo;
  const examples = PROMPT_EXAMPLES[kind];
  const reduced = usePrefersReducedMotion();
  const inputId = useId();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState<RunOutput | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [running, setRunning] = useState(false);
  /** Placeholder nodes shown while an async run is in flight. */
  const [skeleton, setSkeleton] = useState<RunStep[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Held in a ref so `changeInput` stays referentially stable — a parent passing
  // an inline arrow must not be able to re-trigger the reset effect below.
  const notifyRef = useRef(onInputChange);
  useEffect(() => {
    notifyRef.current = onInputChange;
  }, [onInputChange]);

  /** Single write path for the notes: typing and example loads both land here. */
  const changeInput = useCallback((value: string) => {
    setInput(value);
    notifyRef.current?.(value);
  }, []);

  // Reset when the modal is reused for a different product.
  useEffect(() => {
    clearTimers();
    abortRef.current?.abort();
    changeInput("");
    setOutput(null);
    setSkeleton(null);
    setError(null);
    setRevealed(0);
    setRunning(false);
  }, [product.slug, clearTimers, changeInput]);

  // Held in a ref for the same reason as onInputChange: the caller passes an
  // inline closure over the current API key, and `run` must not be rebuilt.
  const executeRef = useRef(execute);
  useEffect(() => {
    executeRef.current = execute;
  }, [execute]);

  /** Async path: play the product's own four nodes while the promise settles. */
  const runAsync = useCallback(
    async (text: string) => {
      clearTimers();
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const placeholder: RunStep[] = product.steps.map((step, index) => ({
        id: `pending-${index}`,
        kind: step.kind,
        label: step.label,
        detail: step.detail,
        ms: 0,
      }));

      setOutput(null);
      setError(null);
      setSkeleton(placeholder);
      setRevealed(reduced ? placeholder.length : 0);
      setRunning(true);

      if (!reduced) {
        placeholder.forEach((_, index) => {
          timers.current.push(
            window.setTimeout(() => setRevealed(index + 1), 320 * (index + 1)),
          );
        });
      }

      try {
        const next = await executeRef.current!(text, controller.signal);
        if (controller.signal.aborted) return;
        clearTimers();
        setSkeleton(null);
        setOutput(next);
        setRevealed(next.steps.length + 1);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        clearTimers();
        setSkeleton(null);
        setError((err as Error).message || "That run didn't finish.");
      } finally {
        if (!controller.signal.aborted) setRunning(false);
      }
    },
    [clearTimers, product.steps, reduced],
  );

  const run = useCallback(
    (text: string) => {
      if (executeRef.current) {
        void runAsync(text);
        return;
      }

      clearTimers();
      const next = simulate(kind, text);
      setOutput(next);
      setRunning(true);

      if (reduced) {
        setRevealed(next.steps.length + 1);
        setRunning(false);
        return;
      }

      setRevealed(0);
      let elapsed = 0;
      next.steps.forEach((step, index) => {
        elapsed += step.ms;
        timers.current.push(
          window.setTimeout(() => setRevealed(index + 1), elapsed),
        );
      });
      timers.current.push(
        window.setTimeout(() => {
          setRevealed(next.steps.length + 1);
          setRunning(false);
        }, elapsed + 320),
      );
    },
    [kind, reduced, clearTimers, runAsync],
  );

  const steps = output?.steps ?? skeleton ?? [];
  const showResult = Boolean(output) && revealed > (output?.steps.length ?? 0);

  return (
    <div className={variant === "inline" ? "" : "text-sm"}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          run(input);
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={inputId} className="eyebrow">
            {kind === "qualifier"
              ? "Paste a real inbound lead"
              : kind === "triage"
                ? "Paste an email you'd rather not answer"
                : kind === "proposal"
                  ? "Paste a scrap of call notes"
                  : "Paste an error your stack threw"}
          </label>
          {statusSlot}
        </div>

        <div className="mt-2 rounded-node border border-line bg-paper shadow-node focus-within:border-node-agent">
          <textarea
            id={inputId}
            value={input}
            onChange={(event) => changeInput(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                run(input);
              }
            }}
            rows={variant === "inline" ? 4 : 3}
            placeholder={examples[0].text}
            className="w-full resize-none bg-transparent px-4 py-3.5 text-[15px] leading-relaxed outline-none placeholder:text-ink-muted/70"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2.5">
            <span className="font-mono text-[11px] text-ink-muted">
              {footerNote ?? "runs in your browser · nothing sent anywhere"}
            </span>
            <button type="submit" className="btn-agent btn-sm" disabled={running}>
              {running ? "Running…" : "Run it"}
              <span aria-hidden className="font-mono text-[11px] opacity-70">
                ⌘↵
              </span>
            </button>
          </div>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => {
              changeInput(example.text);
              run(example.text);
            }}
            className="chip transition-colors hover:border-node-agent hover:text-ink"
          >
            {example.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="animate-riseIn mt-4 rounded-node border border-node-output/35 bg-node-output/[0.06] px-4 py-3 text-sm text-ink-soft">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-node-output">
            didn&apos;t finish
          </span>
          <br />
          {error}
        </p>
      ) : null}

      {steps.length ? (
        <div className="mt-6">
          <ol className="space-y-px">
            {steps.map((step, index) => {
              const state =
                revealed > index ? "done" : revealed === index ? "active" : "idle";
              const color = NODE_COLOR[step.kind];

              return (
                <li
                  key={step.id}
                  className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-opacity duration-300 ${
                    state === "idle" ? "opacity-30" : "opacity-100"
                  } ${state === "active" ? "bg-canvas" : ""}`}
                >
                  <span className="relative mt-1.5 flex h-2.5 w-2.5 shrink-0">
                    {state === "active" ? (
                      <span
                        className={`absolute inline-flex h-full w-full animate-pulseNode rounded-full ${color.dot}`}
                      />
                    ) : null}
                    <span
                      className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                        state === "idle" ? "bg-line-strong" : color.dot
                      }`}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium">{step.label}</span>
                      <span
                        className={`font-mono text-[10px] uppercase tracking-[0.14em] ${color.text}`}
                      >
                        {step.kind}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-muted">
                      {state === "idle" ? "—" : step.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>

          {showResult && renderResult ? (
            <div className="animate-riseIn mt-4">{renderResult(output!)}</div>
          ) : null}

          {showResult && !renderResult && output ? (
            <div className="animate-riseIn mt-4 overflow-hidden rounded-node border border-line bg-canvas/70">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                <p className="flex items-center gap-2 font-medium">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      output.result.tone === "good"
                        ? "bg-node-action"
                        : output.result.tone === "warn"
                          ? "bg-node-trigger"
                          : "bg-ink-muted"
                    }`}
                  />
                  {output.result.verdict}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  simulated run
                </p>
              </div>

              <div className="px-4 py-3">
                <p className="text-sm text-ink-soft">{output.result.summary}</p>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  {output.result.fields.map((field) => (
                    <div key={field.label}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                        {field.label}
                      </dt>
                      <dd
                        className={`text-sm font-medium ${
                          field.tone === "good"
                            ? "text-node-action"
                            : field.tone === "warn"
                              ? "text-node-trigger"
                              : "text-ink"
                        }`}
                      >
                        {field.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {output.result.draft ? (
                  <div className="mt-4 rounded-lg border border-line bg-paper p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                      {output.result.draft.title}
                    </p>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                      {output.result.draft.body}
                    </p>
                  </div>
                ) : null}
              </div>

              {onBuy ? (
                <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
                  <button type="button" className="btn-solid btn-sm" onClick={onBuy}>
                    Buy {product.name}
                  </button>
                  <span className="text-sm text-ink-muted">
                    Set up in {product.setupTime}. Yours to keep.
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
