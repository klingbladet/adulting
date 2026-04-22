import { relations } from "drizzle-orm";
import { pgTable, serial, text, integer, varchar, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  categoryId: uuid("category_id"),
  title: varchar("title", { length: 255 }).notNull(),
  textContent: text("text_content"),
  imageUrl: text("image_url"), 
  videoUrl: varchar("video_url", { length: 255 }),
  status: varchar("status", { length: 255 })
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  correctAnswer: varchar("correct_answer", { length: 255 }),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id), 
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(),
  score: integer("score"),
});

