// Data-access layer for meals (Room's @Dao). Screens call these functions;
// they should not talk to Drizzle or SQLite directly.
import { db } from "@/db";
import { meals, type Meal, type NewMeal } from "@/db/schema";
import {
  deleteAllMealImageFiles,
  deleteMealImageFile,
  persistMealImage,
} from "@/storage/mealImages";
import { desc, eq } from "drizzle-orm";

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

// INSERT a row. The form only sends macros (NewMeal); we generate id + createdAt here.
export const addMeal = async (meal: NewMeal): Promise<Meal> => {
  const id = Date.now().toString();
  const imageUri = meal.imageUri ? persistMealImage(meal.imageUri, id) : null;

  const newMeal: Meal = {
    ...meal,
    id,
    createdAt: new Date().toISOString(),
    imageUri,
  };

  await db.insert(meals).values(newMeal);
  return newMeal;
};

// DELETE FROM meals WHERE id = ?
export const deleteMeal = async (id: string): Promise<void> => {
  const meal = await getMeal(id);
  deleteMealImageFile(meal?.imageUri);
  await db.delete(meals).where(eq(meals.id, id));
};

// DELETE ALL meals
export const deleteAllMeals = async (): Promise<void> => {
  deleteAllMealImageFiles();
  await db.delete(meals);
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
