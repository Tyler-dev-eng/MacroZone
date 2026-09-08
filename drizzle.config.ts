import { defineConfig } from "drizzle-kit";

// CLI config for `npm run db:generate` only — not imported by the app at runtime.
// Kit reads schema.ts, diffs it against previous snapshots, and writes SQL into out/.
export default defineConfig({
  dialect: "sqlite",
  // Expo needs SQL bundled into the app (drizzle/migrations.js), not a live DB URL.
  driver: "expo",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
