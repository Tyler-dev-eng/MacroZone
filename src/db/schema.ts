import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Table definition (Room's @Entity). Drizzle Kit reads this file and
// generates the CREATE TABLE SQL in drizzle/*.sql.
export const meals = sqliteTable("meals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  // real = SQLite floating point, so values like 12.5g are allowed.
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  // Local file URI for the optional meal photo.
  imageUri: text("image_uri"),
  // breakfast | lunch | dinner | snack
  mealType: text("meal_type").notNull(),
  // When the meal was eaten (editable). JS field createdAt maps to created_at.
  createdAt: text("created_at").notNull(),
});

// Row shape returned by SELECT (all columns, including generated ones).
export type Meal = typeof meals.$inferSelect;
// What the form sends — id is added in addMeal().
export type NewMeal = Omit<Meal, "id">;

// Single-row table for daily macro targets (always id = "default").
export const targets = sqliteTable("targets", {
  id: text("id").primaryKey(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
});

export type Targets = typeof targets.$inferSelect;
export type NewTargets = Omit<Targets, "id">;
