// Data-access layer for meals (Room's @Dao). Screens call these functions;
// they should not talk to Drizzle or SQLite directly.
import { db } from "@/db";
import { meals, type Meal, type NewMeal } from "@/db/schema";
import { deleteMealImageFile, persistMealImage } from "@/storage/mealImages";
import { startOfLocalDay, startOfNextLocalDay } from "@/utils/dates";
import { lightImpact } from "@/utils/haptics";
import { queueMacroGlow } from "@/utils/macroGlow";
import { desc, eq, and, gte, lt } from "drizzle-orm";

export type { Meal, NewMeal };

// SELECT * FROM meals WHERE id = ?
export const getMeal = async (id: string): Promise<Meal | undefined> => {
  const [meal] = await db.select().from(meals).where(eq(meals.id, id));
  return meal;
};

// SELECT * FROM meals ORDER BY created_at DESC
export const getMeals = async (): Promise<Meal[]> => {
  return db.select().from(meals).orderBy(desc(meals.createdAt));
};

/** Meals logged on the given local calendar day (defaults to today). */
export const getMealsForDay = async (date = new Date()): Promise<Meal[]> => {
  const start = startOfLocalDay(date).toISOString();
  const end = startOfNextLocalDay(date).toISOString();

  return db
    .select()
    .from(meals)
    .where(and(gte(meals.createdAt, start), lt(meals.createdAt, end)))
    .orderBy(desc(meals.createdAt));
};

// INSERT a row. The form sends macros, meal type, and logged-at; we generate id here.
export const addMeal = async (meal: NewMeal): Promise<Meal> => {
  const id = Date.now().toString();
  const imageUri = meal.imageUri ? persistMealImage(meal.imageUri, id) : null;

  const newMeal: Meal = {
    ...meal,
    id,
    createdAt: meal.createdAt,
    imageUri,
  };

  await db.insert(meals).values(newMeal);
  queueMacroGlow(newMeal);
  lightImpact();
  return newMeal;
};

// DELETE FROM meals WHERE id = ?
export const deleteMeal = async (id: string): Promise<void> => {
  const meal = await getMeal(id);
  deleteMealImageFile(meal?.imageUri);
  await db.delete(meals).where(eq(meals.id, id));
};

// DELETE ALL meals (does not remove saved favorites or their photos)
export const deleteAllMeals = async (): Promise<void> => {
  const all = await getMeals();
  for (const meal of all) {
    deleteMealImageFile(meal.imageUri);
  }
  await db.delete(meals);
};

/** Copies a meal into a new row dated now (photo included). */
export const logMealAgain = async (id: string): Promise<Meal> => {
  const meal = await getMeal(id);
  if (!meal) {
    throw new Error("Meal not found");
  }

  return addMeal({
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    description: meal.description,
    mealType: meal.mealType,
    imageUri: meal.imageUri,
    createdAt: new Date().toISOString(),
  });
};

// UPDATE A MEAL
export const updateMeal = async (meal: Meal): Promise<void> => {
  const existing = await getMeal(meal.id);
  let imageUri = meal.imageUri ?? null;

  if (imageUri && imageUri !== existing?.imageUri) {
    deleteMealImageFile(existing?.imageUri);
    imageUri = persistMealImage(imageUri, meal.id);
  } else if (!imageUri && existing?.imageUri) {
    deleteMealImageFile(existing.imageUri);
  }

  await db
    .update(meals)
    .set({ ...meal, imageUri })
    .where(eq(meals.id, meal.id));
};
