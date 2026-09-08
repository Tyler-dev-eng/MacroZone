import { db } from "@/db";
import { savedMeals, type Meal, type SavedMeal } from "@/db/schema";
import { addMeal } from "@/storage/meals";
import { deleteMealImageFile, persistMealImage } from "@/storage/mealImages";
import { desc, eq } from "drizzle-orm";

export type { SavedMeal };

export const mealFingerprint = (meal: {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}): string =>
  `${meal.name.trim().toLowerCase()}|${meal.calories}|${meal.protein}|${meal.carbs}|${meal.fat}`;

export const getSavedMeals = async (): Promise<SavedMeal[]> => {
  return db.select().from(savedMeals).orderBy(desc(savedMeals.createdAt));
};

export const getSavedMeal = async (
  id: string,
): Promise<SavedMeal | undefined> => {
  const [row] = await db.select().from(savedMeals).where(eq(savedMeals.id, id));
  return row;
};

export const findSavedMeal = async (
  meal: Parameters<typeof mealFingerprint>[0],
): Promise<SavedMeal | undefined> => {
  const target = mealFingerprint(meal);
  const all = await getSavedMeals();
  return all.find((saved) => mealFingerprint(saved) === target);
};

/** Saves a logged meal as a reusable favorite (copies the photo). */
export const saveMealAsFavorite = async (meal: Meal): Promise<SavedMeal> => {
  const existing = await findSavedMeal(meal);
  if (existing) return existing;

  const id = `fav-${Date.now().toString()}`;
  const imageUri = meal.imageUri ? persistMealImage(meal.imageUri, id) : null;

  const saved: SavedMeal = {
    id,
    name: meal.name.trim(),
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    mealType: meal.mealType,
    imageUri,
    createdAt: new Date().toISOString(),
  };

  await db.insert(savedMeals).values(saved);
  return saved;
};

export const deleteSavedMeal = async (id: string): Promise<void> => {
  const saved = await getSavedMeal(id);
  deleteMealImageFile(saved?.imageUri);
  await db.delete(savedMeals).where(eq(savedMeals.id, id));
};

/** Stars or unstars a logged meal based on name + macros. */
export const toggleFavorite = async (meal: Meal): Promise<boolean> => {
  const existing = await findSavedMeal(meal);
  if (existing) {
    await deleteSavedMeal(existing.id);
    return false;
  }
  await saveMealAsFavorite(meal);
  return true;
};

/** Logs a favorite as a new meal for right now. */
export const logSavedMeal = async (id: string): Promise<Meal> => {
  const saved = await getSavedMeal(id);
  if (!saved) {
    throw new Error("Saved meal not found");
  }

  return addMeal({
    name: saved.name,
    calories: saved.calories,
    protein: saved.protein,
    carbs: saved.carbs,
    fat: saved.fat,
    mealType: saved.mealType,
    imageUri: saved.imageUri,
    createdAt: new Date().toISOString(),
  });
};
