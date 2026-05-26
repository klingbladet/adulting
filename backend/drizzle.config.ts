import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: "../.env" });
dotenv.config({ path: "./.env" });

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const databaseUrl =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${
    process.env.POSTGRES_HOST ?? "localhost"
  }:${process.env.POSTGRES_PORT ?? "5432"}/${process.env.POSTGRES_DB}`;

if (!databaseUrl || databaseUrl.includes("undefined")) {
  throw new Error(
    "Missing database config. Set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB.",
  );
}

console.log(
  hasDatabaseUrl
    ? "Using DATABASE_URL from environment"
    : "Using DATABASE_URL built from POSTGRES_* variables",
);

export default defineConfig({
  schema: [
    "./src/db/schema.ts",
    "./src/db/auth-schema.ts",
    "./src/db/course-schema.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});