import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const aiRoleEnum = pgEnum("ai_role", ["user", "assistant"]);

export const aiThreads = pgTable("ai_threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Ny AI-chatt"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .notNull()
    .references(() => aiThreads.id, { onDelete: "cascade" }),
  role: aiRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const aiThreadSettings = pgTable("ai_thread_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .notNull()
    .references(() => aiThreads.id, { onDelete: "cascade" }),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export * from "./auth-schema";
export * from "./course-schema";
