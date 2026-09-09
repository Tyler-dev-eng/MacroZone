export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_META: Record<
  MealType,
  { color: string; icon: "cafe" | "restaurant" | "moon" | "nutrition" }
> = {
  breakfast: { color: "#ffb347", icon: "cafe" },
  lunch: { color: "#4fc3f7", icon: "restaurant" },
  dinner: { color: "#a78bfa", icon: "moon" },
  snack: { color: "#f472b6", icon: "nutrition" },
};

export const isMealType = (value: string): value is MealType =>
  (MEAL_TYPES as readonly string[]).includes(value);

export const normalizeMealType = (value: string): MealType =>
  isMealType(value) ? value : "snack";

export const mealTypeLabel = (type: string): string => {
  const normalized = normalizeMealType(type);
  return normalized[0].toUpperCase() + normalized.slice(1);
};

export const groupMealsByType = <T extends { mealType: string }>(
  meals: T[],
): Record<MealType, T[]> => {
  const groups: Record<MealType, T[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const meal of meals) {
    groups[normalizeMealType(meal.mealType)].push(meal);
  }
  return groups;
};

/** Picks a meal type from the local hour. */
export const defaultMealType = (date = new Date()): MealType => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 22) return "dinner";
  return "snack";
};

export const formatLoggedAt = (value: string | Date): string => {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatLoggedAtTime = (value: string | Date): string => {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatLoggedAtDate = (value: string | Date): string => {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};
