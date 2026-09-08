// Data-access layer for daily macro targets. Screens call these functions;
// they should not talk to Drizzle or SQLite directly.
import { db } from "@/db";
import { targets, type NewTargets, type Targets } from "@/db/schema";
import { eq } from "drizzle-orm";

export type { NewTargets, Targets };

export const DEFAULT_TARGET_ID = "default";

/** Fallback goals used until the user saves their own (matches the original home-screen values). */
export const DEFAULT_TARGETS: Targets = {
  id: DEFAULT_TARGET_ID,
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

/** SELECT the saved targets, or the built-in defaults if none exist yet. */
export const getTargets = async (): Promise<Targets> => {
  const [row] = await db
    .select()
    .from(targets)
    .where(eq(targets.id, DEFAULT_TARGET_ID));
  return row ?? DEFAULT_TARGETS;
};

/** INSERT or UPDATE the singleton targets row. */
export const saveTargets = async (values: NewTargets): Promise<Targets> => {
  const next: Targets = { id: DEFAULT_TARGET_ID, ...values };
  const [existing] = await db
    .select()
    .from(targets)
    .where(eq(targets.id, DEFAULT_TARGET_ID));

  if (existing) {
    await db
      .update(targets)
      .set(values)
      .where(eq(targets.id, DEFAULT_TARGET_ID));
  } else {
    await db.insert(targets).values(next);
  }

  return next;
};
