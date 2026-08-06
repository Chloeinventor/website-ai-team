import { extractScopeWithModel, generateFollowUpsWithModel } from "./anthropic";
import { classifyFit } from "./classify";
import { extractScope } from "./extract";
import { generateFollowUps } from "./follow-ups";
import { fillTemplate } from "./template";
import type { ProposalRun } from "./types";

export { classifyFit } from "./classify";
export { extractScope } from "./extract";
export { generateFollowUps } from "./follow-ups";
export { fillTemplate } from "./template";
export * from "./types";

/**
 * The four nodes, in order, with the key-optional strategy applied per node:
 *
 *   02 extractScope      model when a key is present, heuristic otherwise
 *   02b classifyFit      always deterministic — the pill must be reproducible
 *   03 fillTemplate      always deterministic — pricing is a rate card, not a guess
 *   04 generateFollowUps model when a key is present, heuristic otherwise
 *
 * The two language jobs (understanding notes, writing emails) are where a model
 * earns its place. The two judgement jobs (a verdict, a price) stay in code so
 * the same notes always produce the same number.
 *
 * A model failure is never fatal: it falls back to the heuristic path and says
 * so in `warning`.
 */
export async function runProposal(
  notes: string,
  options: { apiKey?: string | null; now?: Date; signal?: AbortSignal } = {},
): Promise<ProposalRun> {
  const now = options.now ?? new Date();
  const key = options.apiKey?.trim() || null;

  if (!key) {
    const scope = extractScope(notes, now);
    return {
      scope,
      fit: classifyFit(scope),
      doc: fillTemplate(scope),
      followUps: generateFollowUps(scope, now),
      source: "heuristic",
    };
  }

  try {
    const scope = await extractScopeWithModel(notes, key, options.signal);
    const followUps = await generateFollowUpsWithModel(
      scope,
      key,
      now,
      options.signal,
    );

    return {
      scope,
      fit: classifyFit(scope),
      doc: fillTemplate(scope),
      followUps,
      source: "model",
    };
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;

    const scope = extractScope(notes, now);
    return {
      scope,
      fit: classifyFit(scope),
      doc: fillTemplate(scope),
      followUps: generateFollowUps(scope, now),
      source: "heuristic",
      warning: `Your key didn't work (${(error as Error).message}) — ran the offline version instead.`,
    };
  }
}
