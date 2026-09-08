// Data-access layer for meals (Room's @Dao). Screens call these functions;
// they should not talk to Drizzle or SQLite directly.
import { db } from "@/db";
import { meals, type Meal, type NewMeal } from "@/db/schema";
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
  const newMeal: Meal = {
    ...meal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  await db.insert(meals).values(newMeal);
  return newMeal;
};

// DELETE FROM meals WHERE id = ?
export const deleteMeal = async (id: string): Promise<void> => {
  await db.delete(meals).where(eq(meals.id, id));
};

// DELETE ALL meals
export const deleteAllMeals = async (): Promise<void> => {
  await db.delete(meals);
};

// UPDATE A MEAL
export const updateMeal = async (meal: Meal): Promise<void> => {
  await db.update(meals).set(meal).where(eq(meals.id, meal.id));
};
