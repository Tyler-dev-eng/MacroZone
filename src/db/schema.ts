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
  // JS field createdAt maps to the created_at column in SQLite.
  createdAt: text("created_at").notNull(),
});

// Row shape returned by SELECT (all columns, including generated ones).
export type Meal = typeof meals.$inferSelect;
// What the form sends — id and createdAt are added in addMeal().
export type NewMeal = Omit<Meal, "id" | "createdAt">;

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
