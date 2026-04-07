import { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({path: "./.env"});

export default {
  schema: "./src/db/schema.ts", // Här definierar ni era tabeller (Users, Courses, etc)
  out: "./drizzle",             // Här hamnar era SQL-migrationsfiler
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Hämtas från Supabase Settings -> Database
  },
    verbose: true,
    strict: true
} satisfies Config;