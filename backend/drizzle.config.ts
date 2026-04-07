import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts", // Här definierar ni era tabeller (Users, Courses, etc)
  out: "./drizzle",             // Här hamnar era SQL-migrationsfiler
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL, // Hämtas från Supabase Settings -> Database
  },
});