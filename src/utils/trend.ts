import { type Meal } from "@/storage/meals";
import { daysAgo, localDayKey } from "@/utils/dates";

export type DayMacros = {
  key: string;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/** Totals for each local day in `[today - (dayCount-1) … today]`. */
export const buildDailyMacros = (
  meals: Meal[],
  dayCount: number,
  now = new Date(),
): DayMacros[] => {
  const days: DayMacros[] = [];
  const byKey = new Map<string, DayMacros>();

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const date = daysAgo(offset, now);
    const key = localDayKey(date);
    const bucket = {
      key,
      date,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    days.push(bucket);
    byKey.set(key, bucket);
  }

  for (const meal of meals) {
    const bucket = byKey.get(localDayKey(new Date(meal.createdAt)));
    if (!bucket) continue;
    bucket.calories += meal.calories;
    bucket.protein += meal.protein;
    bucket.carbs += meal.carbs;
    bucket.fat += meal.fat;
  }

  return days;
};

export const weekdayLabel = (date: Date): string =>
  date.toLocaleDateString("en-US", { weekday: "narrow" });

export const dayNumberLabel = (date: Date): string => String(date.getDate());
