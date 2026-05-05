import { relations } from "drizzle-orm";
import { user } from "./auth-schema"
import { pgTable, uuid, varchar, serial, integer, text } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  iconName: varchar("icon_name", { length: 255 }), // T.ex. "House", "Wallet"
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "no action" }),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  textContent: text("text_content"),
  imageUrl: text("image_url"), 
  videoUrl: varchar("video_url", { length: 255 }),
  time: integer("time"),
  blocks: integer("blocks"),
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
    .references(() => user.id, { onDelete: "no action" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(),
  score: integer("score"),
});

// --- RELATIONER (Drizzle Query API) ---

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
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
  quizzes: many(quizzes),
  progress: many(userProgress),
}));

export const quizzesRelations = relations(quizzes, ({ one }) => ({
  course: one(courses, {
    fields: [quizzes.courseId],
    references: [courses.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(user, {
    fields: [userProgress.userId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [userProgress.courseId],
    references: [courses.id],
  }),
}));
