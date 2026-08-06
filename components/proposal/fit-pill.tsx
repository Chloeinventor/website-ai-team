import type { PillLevel } from "@/lib/demo/proposal/types";

const STATES: Record<
  PillLevel,
  { label: string; dot: string; text: string; border: string; hint: string }
> = {
  idle: {
    label: "waiting for notes",
    dot: "bg-line-strong",
    text: "text-ink-muted",
    border: "border-line",
    hint: "Paste anything from the call to see how much there is to scope.",
  },
  good: {
    label: "good fit",
    dot: "bg-node-action",
    text: "text-node-action",
    border: "border-node-action/35",
    hint: "Budget, deadline and deliverables are all in there. Enough to price.",
  },
  unclear: {
    label: "unclear",
    dot: "bg-node-trigger",
    text: "text-node-trigger",
    border: "border-node-trigger/35",
    hint: "Some of it is there. The gaps become assumptions in the draft.",
  },
  poor: {
    label: "too thin",
    dot: "bg-node-output",
    text: "text-node-output",
    border: "border-node-output/35",
    hint: "Not enough to scope from. Paste more of what they actually said.",
  },
};

/**
 * Live scope-signal pill. Sits beside the notes field and changes as you type —
 * the thing you'd glance at before deciding the call was worth writing up.
 */
export function FitPill({ level }: { level: PillLevel }) {
  const state = STATES[level];

  return (
    <span
      className={`chip ${state.border} ${state.text} transition-colors duration-200`}
      title={state.hint}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${state.dot} transition-colors duration-200`}
      />
      {state.label}
      <span className="sr-only">. {state.hint}</span>
    </span>
  );
}

export function fitHint(level: PillLevel): string {
  return STATES[level].hint;
}
