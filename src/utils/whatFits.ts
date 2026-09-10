import { type Targets } from "@/storage/targets";
import { type MacroKey, type MacroTotals } from "@/utils/zone";

export type WhatFitsItem = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type WhatFitsCue = {
  lead: string;
  suggestions: string[];
  line: string;
};

const GENERIC: WhatFitsItem[] = [
  { name: "Greek yogurt", calories: 130, protein: 18, carbs: 8, fat: 0 },
  { name: "chicken", calories: 185, protein: 35, carbs: 0, fat: 4 },
  { name: "eggs", calories: 155, protein: 13, carbs: 1, fat: 11 },
  { name: "cottage cheese", calories: 120, protein: 14, carbs: 5, fat: 5 },
  { name: "a banana", calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: "rice", calories: 205, protein: 4, carbs: 45, fat: 0 },
  { name: "oatmeal", calories: 165, protein: 6, carbs: 28, fat: 3 },
  { name: "almonds", calories: 160, protein: 6, carbs: 6, fat: 14 },
];

const GRAM_MACROS: Exclude<MacroKey, "calories">[] = [
  "protein",
  "carbs",
  "fat",
];

const remainingOf = (totals: MacroTotals, targets: Targets): MacroTotals => ({
  calories: targets.calories - totals.calories,
  protein: targets.protein - totals.protein,
  carbs: targets.carbs - totals.carbs,
  fat: targets.fat - totals.fat,
});

const formatGrams = (value: number): string => {
  const rounded = Math.round(value);
  return String(rounded);
};

const focusMacro = (
  remaining: MacroTotals,
  targets: Targets,
): Exclude<MacroKey, "calories"> => {
  let best: Exclude<MacroKey, "calories"> = "protein";
  let bestRatio = Number.NEGATIVE_INFINITY;
  for (const macro of GRAM_MACROS) {
    const left = remaining[macro];
    const target = targets[macro];
    if (left <= 0) continue;
    const ratio = target <= 0 ? left : left / target;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = macro;
    }
  }
  return best;
};

const density = (
  item: WhatFitsItem,
  focus: Exclude<MacroKey, "calories">,
): number => {
  if (item.calories <= 0) return 0;
  return item[focus] / item.calories;
};

const fitsCalories = (item: WhatFitsItem, calorieRoom: number): boolean =>
  item.calories > 0 && item.calories <= calorieRoom;

const uniqueNames = (items: WhatFitsItem[]): WhatFitsItem[] => {
  const seen = new Set<string>();
  const next: WhatFitsItem[] = [];
  for (const item of items) {
    const key = item.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    next.push(item);
  }
  return next;
};

const pickSuggestions = (
  remaining: MacroTotals,
  targets: Targets,
  owned: WhatFitsItem[],
): string[] => {
  const room = remaining.calories;
  const focus = focusMacro(remaining, targets);
  const rank = (item: WhatFitsItem) => density(item, focus);

  const fromOwned = uniqueNames(owned)
    .filter((item) => fitsCalories(item, room))
    .sort((a, b) => rank(b) - rank(a));

  const used = new Set(fromOwned.map((item) => item.name.trim().toLowerCase()));
  const fromGeneric = GENERIC.filter(
    (item) =>
      fitsCalories(item, room) && !used.has(item.name.trim().toLowerCase()),
  ).sort((a, b) => rank(b) - rank(a));

  return [...fromOwned, ...fromGeneric].slice(0, 2).map((item) => item.name);
};

const leftoverLead = (
  remaining: MacroTotals,
  targets: Targets,
): string | null => {
  if (remaining.calories <= 0) return null;

  const parts = [
    `${Math.round(remaining.calories).toLocaleString("en-US")} cal`,
  ];
  const focus = focusMacro(remaining, targets);
  const gramsLeft = remaining[focus];
  if (gramsLeft > 0.5) {
    parts.push(`${formatGrams(gramsLeft)}g ${focus}`);
  }
  return `${parts.join(" and ")} left`;
};

/**
 * One-line next-bite cue from remaining macros, favorites, and a tiny fallback list.
 */
export const getWhatFits = (
  totals: MacroTotals,
  targets: Targets,
  owned: WhatFitsItem[] = [],
): WhatFitsCue | null => {
  const remaining = remainingOf(totals, targets);
  const lead = leftoverLead(remaining, targets);
  if (!lead) return null;

  const suggestions = pickSuggestions(remaining, targets, owned);
  if (suggestions.length === 0) return null;

  const suggestionText =
    suggestions.length === 1
      ? suggestions[0]
      : `${suggestions[0]} or ${suggestions[1]}`;

  return {
    lead,
    suggestions,
    line: `${lead} — ${suggestionText}.`,
  };
};
