/**
 * "Danmark på kortet": the levels sold on the website. Level 1 is free; levels
 * 2–8 are 39 kr. each, or 149 kr. for all of them. Mirrors LEVELS in
 * tools/danish-rail-finder/variants.py.
 */
export type Lang = "da" | "en";

export interface Level {
  n: number;
  name: Record<Lang, string>;
  holds: Record<Lang, string>;
}

export const SERIES = "Danmark på kortet";

export const LEVELS: Level[] = [
  { n: 1, name: { en: "Capital Region: major towns", da: "Region Hovedstaden: større byer" },
    holds: { en: "22 major towns, one guess each", da: "22 større byer, ét gæt hver" } },
  { n: 2, name: { en: "Denmark's cities", da: "Danmarks storbyer" },
    holds: { en: "The 18 cities with 40,000+ people", da: "De 18 byer med over 40.000 indbyggere" } },
  { n: 3, name: { en: "Famous towns and their stories", da: "Kendte byer og deres historier" },
    holds: { en: "72 towns, each with a fact card", da: "72 byer, hver med et faktakort" } },
  { n: 4, name: { en: "Major towns across Denmark", da: "Større byer i hele Danmark" },
    holds: { en: "34 major towns outside the Capital Region", da: "34 større byer uden for Region Hovedstaden" } },
  { n: 5, name: { en: "Copenhagen S-tog & Metro", da: "København: S-tog og metro" },
    holds: { en: "122 S-tog and Metro stops", da: "122 S-togs- og metrostationer" } },
  { n: 6, name: { en: "Zealand, Lolland & Falster stations", da: "Stationer på Sjælland, Lolland og Falster" },
    holds: { en: "92 train and local-line stations outside Copenhagen", da: "92 tog- og lokalbanestationer uden for København" } },
  { n: 7, name: { en: "Jutland & Funen stations", da: "Stationer i Jylland og på Fyn" },
    holds: { en: "179 train and light-rail stations", da: "179 tog- og letbanestationer" } },
  { n: 8, name: { en: "Minor towns of Denmark", da: "Danmarks mindre byer" },
    holds: { en: "268 towns with under 10,000 people", da: "268 byer med under 10.000 indbyggere" } },
];

export const FREE_LEVEL = 1;
export const PAID_LEVELS = [2, 3, 4, 5, 6, 7, 8];

export type Product = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "bundle";

/** Prices in øre (DKK minor units). */
export const LEVEL_PRICE = 3900;
export const BUNDLE_PRICE = 14900;

export function isProduct(value: unknown): value is Product {
  return value === "bundle" || (typeof value === "string" && PAID_LEVELS.includes(Number(value)) && /^\d$/.test(value));
}

export function priceOf(product: Product): number {
  return product === "bundle" ? BUNDLE_PRICE : LEVEL_PRICE;
}

/** The paid levels a product unlocks. */
export function levelsOf(product: string): number[] {
  if (product === "bundle") return [...PAID_LEVELS];
  const n = Number(product);
  return PAID_LEVELS.includes(n) ? [n] : [];
}

export function productName(product: Product, lang: Lang): string {
  if (product === "bundle") return `${SERIES} · ${lang === "da" ? "Alle niveauer (2–8)" : "All levels (2–8)"}`;
  const level = LEVELS.find((l) => l.n === Number(product))!;
  return `${SERIES} · ${lang === "da" ? "Niveau" : "Level"} ${level.n} · ${level.name[lang]}`;
}

/** "39 kr." / "39 kr" */
export function formatPrice(ore: number, lang: Lang): string {
  return `${Math.round(ore / 100)} ${lang === "da" ? "kr." : "kr"}`;
}
