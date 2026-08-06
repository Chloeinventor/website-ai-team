import type { FollowUp, ScopeExtract } from "./types";

/**
 * 04 · OUTPUT — generateFollowUps (heuristic path)
 *
 * Three touches at +3 / +7 / +14 days. The offsets are the schedule the real
 * workflow writes into a table for a cron sweep to pick up — see the README's
 * n8n notes on why this isn't a chain of Wait nodes.
 *
 * `now` is injectable so the dates are testable.
 */

const OFFSETS = [3, 7, 14] as const;

function label(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function subjectHint(scope: ScopeExtract): string {
  const first = scope.deliverables[0];
  if (!first) return "the proposal";

  return (
    first
      .split(/\s+/)
      .slice(0, 4)
      .join(" ")
      // A subject line must not end mid-thought — "Re: leads scored and".
      .replace(/\s+(?:and|or|plus|to|for|with|the|a|an|in|on|of|by)$/i, "")
      .replace(/[.,;]$/, "") || "the proposal"
  );
}

export function generateFollowUps(
  scope: ScopeExtract,
  now: Date = new Date(),
): FollowUp[] {
  const hint = subjectHint(scope);
  const urgency = scope.deadline.driver
    ? `Given ${scope.deadline.driver} is the fixed point, `
    : scope.deadline.date
      ? `With ${scope.deadline.date} as the target, `
      : "";

  const bodies = [
    `Sent the proposal over on Monday — just making sure it landed rather than chasing a decision. Happy to walk through the pricing table if any line looks odd.`,

    `${urgency}I'd want to start within the next week to hit it comfortably. No pressure either way, but if the scope needs trimming to fit a number, tell me and I'll re-cut it rather than have you say no to the whole thing.`,

    `Last one from me — I'll assume the timing isn't right and stop cluttering your inbox. The proposal stays valid for [30 days] if things change, and the door's open after that too.`,
  ];

  return OFFSETS.map((sendOffsetDays, index) => ({
    subject:
      index === 0
        ? `Re: ${hint}`
        : index === 1
          ? `${hint} — still worth doing?`
          : `Closing the loop on ${hint}`,
    sendOffsetDays,
    sendDateLabel: label(new Date(now.getTime() + sendOffsetDays * 86_400_000)),
    body: bodies[index],
  }));
}
