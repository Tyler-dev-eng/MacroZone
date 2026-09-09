import { type Meal } from "@/storage/meals";
import { type Targets } from "@/storage/targets";

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MacroKey = keyof MacroTotals;

export type ZoneKind = "empty" | "onTrack" | "close" | "inZone" | "over";

export type ZoneStatus = {
  kind: ZoneKind;
  title: string;
  detail: string;
  accent: MacroKey | null;
};

const MACROS: {
  key: MacroKey;
  noun: string;
}[] = [
  { key: "calories", noun: "calories" },
  { key: "protein", noun: "protein" },
  { key: "carbs", noun: "carbs" },
  { key: "fat", noun: "fat" },
];

/** Floor for "in the zone" — all macros at least this fraction of target, none over. */
const IN_ZONE_MIN = 0.9;
/** Calorie progress at which a remaining gap reads as "close" instead of "on track". */
const CLOSE_DAY_PROGRESS = 0.7;

export const sumMealMacros = (meals: Meal[]): MacroTotals =>
  meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

const progressOf = (current: number, target: number): number => {
  if (target <= 0) return current > 0 ? Number.POSITIVE_INFINITY : 1;
  return current / target;
};

const formatGap = (amount: number, key: MacroKey): string => {
  const abs = Math.abs(amount);
  if (key === "calories") {
    return `${Math.round(abs).toLocaleString("en-US")} cal`;
  }
  const rounded = Number.isInteger(abs)
    ? String(abs)
    : String(Number(abs.toFixed(1)));
  return `${rounded}g`;
};

/**
 * One-line Home status: in the zone, close to it, still on track, or over a target.
 */
export const getZoneStatus = (
  totals: MacroTotals,
  targets: Targets,
): ZoneStatus => {
  const hasLogged =
    totals.calories > 0 ||
    totals.protein > 0 ||
    totals.carbs > 0 ||
    totals.fat > 0;

  if (!hasLogged) {
    return {
      kind: "empty",
      title: "Ready when you are",
      detail: "Log a meal to enter the zone",
      accent: null,
    };
  }

  const snapshots = MACROS.map((macro) => {
    const current = totals[macro.key];
    const target = targets[macro.key];
    return {
      ...macro,
      current,
      target,
      progress: progressOf(current, target),
      remaining: target - current,
    };
  });

  const overs = snapshots
    .filter((macro) => macro.remaining < 0)
    .sort((a, b) => b.progress - a.progress);

  if (overs[0]) {
    const worst = overs[0];
    return {
      kind: "over",
      title: `Over on ${worst.noun}`,
      detail: `${formatGap(worst.remaining, worst.key)} over`,
      accent: worst.key,
    };
  }

  const allInZone = snapshots.every((macro) => macro.progress >= IN_ZONE_MIN);
  if (allInZone) {
    return {
      kind: "inZone",
      title: "In the zone",
      detail: "All macros on target",
      accent: null,
    };
  }

  const furthest = [...snapshots].sort((a, b) => a.progress - b.progress)[0];
  if (!furthest) {
    return {
      kind: "onTrack",
      title: "On track",
      detail: "Keep logging",
      accent: null,
    };
  }

  const calorieProgress =
    snapshots.find((macro) => macro.key === "calories")?.progress ?? 0;
  const isClose = calorieProgress >= CLOSE_DAY_PROGRESS;

  return {
    kind: isClose ? "close" : "onTrack",
    title: isClose ? "Close" : "On track",
    detail: isClose
      ? `${formatGap(furthest.remaining, furthest.key)} ${furthest.noun} short`
      : `${formatGap(furthest.remaining, furthest.key)} ${furthest.noun} to go`,
    accent: furthest.key,
  };
};
