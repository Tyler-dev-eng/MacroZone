import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

export const DATABASE_NAME = "macrozone.db";

// Opens (or creates) the SQLite file on device. Room's databaseBuilder equivalent.
export const sqlite = openDatabaseSync(DATABASE_NAME);

// Drizzle wrapper around that file. Pass schema so queries are typed
// (db.select().from(meals) knows the columns). This is what meals.ts imports.
export const db = drizzle(sqlite, { schema });
