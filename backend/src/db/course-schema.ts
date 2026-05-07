import { relations } from "drizzle-orm";
import { user } from "./auth-schema"
import { pgTable, uuid, varchar, serial, integer, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "no action" }), // Motsvarar creator_id i din mall
  categoryId: uuid("category_id").references(() => categories.id),
  title: varchar("title", { length: 255 }).notNull(),
  isPublished: boolean("is_published").notNull().default(false),
});

export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  orderIndex: integer("order_index").notNull(),
  title: varchar("title", { length: 255 }),
  content: jsonb("content"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  blockId: integer("block_id")
    .notNull()
    .references(() => blocks.id, { onDelete: "cascade" }), // Enligt din mall
  questionText: text("question_text").notNull(),
  correctAnswer: varchar("correct_answer", { length: 255 }),
});

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 255 }),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id),
  givenAnswer: varchar("given_answer", { length: 255 }),
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at").notNull(),
});

export const userCourses = pgTable("user_courses", {
  id: uuid("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  // status: "not_started" | "in_progress" | "completed"
  status: varchar("status", { length: 255 }).notNull(),
  enrolledAt: timestamp("enrolled_at").notNull(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
});

export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  achievementId: uuid("achievement_id")
    .notNull()
    .references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").notNull(),
});

// --- RELATIONER (Drizzle Query API) ---

export const userCoursesRelations = relations(userCourses, ({ one }) => ({
  user: one(user, { fields: [userCourses.userId], references: [user.id] }),
  course: one(courses, { fields: [userCourses.courseId], references: [courses.id] }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  creator: one(user, {
    fields: [courses.userId],
    references: [user.id],
  }),
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  blocks: many(blocks),
  enrollments: many(userCourses),
}));

export const blocksRelations = relations(blocks, ({ one, many }) => ({
  course: one(courses, { fields: [blocks.courseId], references: [courses.id] }),
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  block: one(blocks, { fields: [quizzes.blockId], references: [blocks.id] }),
  attempts: many(quizAttempts),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(user, { fields: [quizAttempts.userId], references: [user.id] }),
  quiz: one(quizzes, { fields: [quizAttempts.quizId], references: [quizzes.id] }),
}));