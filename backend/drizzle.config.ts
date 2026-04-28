import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: "./.env" });

export default defineConfig({
  schema: [
    "./src/db/schema.ts",
    "./src/db/auth-schema.ts",
    "./src/db/course-schema.ts"
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});