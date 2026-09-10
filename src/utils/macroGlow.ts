import { type Meal } from "@/db/schema";
import { type Targets } from "@/storage/targets";
import { localDayKey } from "@/utils/dates";
import { type MacroKey } from "@/utils/zone";

const MACRO_KEYS: MacroKey[] = ["calories", "protein", "carbs", "fat"];

let pending: Meal | null = null;

/** Remember a just-logged meal so Home can glow the card that moved. */
export const queueMacroGlow = (meal: Meal): void => {
  pending = meal;
};

export const peekQueuedMacroGlow = (): Meal | null => pending;

export const clearQueuedMacroGlow = (): void => {
  pending = null;
};

/** Which Home card a meal pushed hardest, as a share of that macro's target. */
export const dominantMacroFromMeal = (
  meal: Meal,
  targets: Targets,
): MacroKey | null => {
  let best: MacroKey | null = null;
  let bestScore = 0;

  for (const key of MACRO_KEYS) {
    const amount = meal[key];
    if (amount <= 0) continue;
    const target = targets[key];
    const score = target > 0 ? amount / target : amount;
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }

  return best;
};

export const isMealOnLocalDay = (meal: Meal, date = new Date()): boolean =>
  localDayKey(new Date(meal.createdAt)) === localDayKey(date);
