import type { FitLevel, ScopeExtract } from "./types";

/**
 * 02b · classifyFit — deterministic in both paths, on purpose.
 *
 * The verdict beside the notes field has to be reproducible: the same notes
 * must always produce the same pill, whether the scope came from the heuristic
 * extractor or from a model. So this reads the extracted scope and nothing
 * else — no second model call, no sampling.
 *
 * It grades what you can price from, not whether the deal is good:
 *   good     — deliverables, a budget signal, and a date or a driver
 *   unclear  — enough to draft, with gaps that become assumptions
 *   poor     — not enough to scope at all
 */
export function classifyFit(scope: ScopeExtract): FitLevel {
  const hasDeliverables = scope.deliverables.length > 0;
  const hasBudget = scope.budgetSignal.confidence !== "absent";
  const hasTiming = Boolean(scope.deadline.date || scope.deadline.driver);
  const hasProblem = scope.problem.trim().length >= 20;

  if (!hasDeliverables && !hasProblem) return "poor";
  if (hasDeliverables && hasBudget && hasTiming) return "good";

  const signals = [hasDeliverables, hasBudget, hasTiming, hasProblem].filter(
    Boolean,
  ).length;

  return signals >= 2 ? "unclear" : "poor";
}
