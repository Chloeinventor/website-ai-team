/**
 * PLACEHOLDER RATE CARD — replace before launch (README).
 *
 * In the shipped product this is the buyer's own Excel/Sheets template, read at
 * the start of every run. Here it's a constant so the demo has a contract to
 * check against. The numbers are in minor units.
 */

export interface RateCard {
  /** Lane key is `from>to`, lowercased. Agreed all-in base freight. */
  lanes: Record<string, number>;
  /** Fuel/BAF ceiling, as a percentage of the agreed base. */
  surchargeCapPct: number;
  /** Accessorials the contract actually permits, normalised. */
  agreedAccessorials: string[];
  /** Days of demurrage/detention included before charges may start. */
  demurrageFreeDays: number;
  /** Ignore anything smaller than this, in minor units — noise, not money. */
  floorMinor: number;
}

export const DEFAULT_RATE_CARD: RateCard = {
  lanes: {
    "rotterdam>felixstowe": 130_000,
    "felixstowe>rotterdam": 130_000,
    "shanghai>felixstowe": 285_000,
    "singapore>rotterdam": 310_000,
    "manila>singapore": 96_000,
  },
  surchargeCapPct: 12,
  agreedAccessorials: [
    "documentation",
    "customs entry",
    "terminal handling",
    "thc",
    "container release",
  ],
  demurrageFreeDays: 5,
  floorMinor: 500,
};

/** Lane lookup that tolerates casing and spacing differences. */
export function agreedBaseFor(
  card: RateCard,
  lane: { from: string; to: string } | null,
): number | null {
  if (!lane) return null;
  const key = `${lane.from.trim().toLowerCase()}>${lane.to.trim().toLowerCase()}`;
  return card.lanes[key] ?? null;
}
