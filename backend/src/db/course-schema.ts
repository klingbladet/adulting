import { relations } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema"
import { pgTable, uuid, varchar, serial, integer, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";

//definerade värden som tillåts i databasen
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const quizTypeEnum = pgEnum("quiz_type", ["diagnostic", "practice", "review"]);
export const quizStatusEnum = pgEnum("quiz_status", ["draft", "published", "archived"]);

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
  time: integer("time"),
  blocks: integer("blocks"),
  status: varchar("status", { length: 255 }).notNull(),
  isPublished: boolean("is_published").notNull().default(false),
});

export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "no action" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  orderIndex: integer("order_index").notNull(),
  title: varchar("title", { length: 255 }),
  content: jsonb("content"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  quizEligible: boolean("quiz_eligible").default(true).notNull(), //För att AI ska fatta om den är "quiz lämplig"
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .references(() => user.id, { onDelete: "no action" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: quizTypeEnum("type").notNull(),
  status: quizStatusEnum("status").notNull(),
  generatedByAi: boolean("generated_by_ai").default(true).notNull(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  blockId: integer("block_id")
    .notNull()
    .references(() => blocks.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .references(() => user.id, { onDelete: "no action" }),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctOptionId: varchar("correct_option_id", { length: 1 }).notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const quizAnswers = pgTable("quiz_answers", {
    id: uuid("id").defaultRandom().primaryKey(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => quizAttempts.id, { onDelete: "cascade" }),
    questionId: integer("question_id")
      .notNull()
      .references(() => quizQuestions.id, { onDelete: "cascade" }),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    blockId: integer("block_id")
      .notNull()
      .references(() => blocks.id, { onDelete: "cascade" }),
    selectedOptionId: varchar("selected_option_id", { length: 1 }).notNull(),
    isCorrect: boolean("is_correct").notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  });

export const achievements = pgTable("achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 255 }),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "no action" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id),
  givenAnswer: varchar("given_answer", { length: 255 }),
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at").notNull(),
});

export const userCourses = pgTable("user_courses", {
  id: uuid("id").defaultRandom().primaryKey(),
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
  // Personalisering: "beginner" | "intermediate" | "advanced"
  knowledgeLevel: varchar("knowledge_level", { length: 50 }),
});

export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  achievementId: uuid("achievement_id")
    .notNull()
    .references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").notNull(),
});

// --- RELATIONER (Drizzle Query API) ---

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

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
  creator: one(user, {
    fields: [blocks.userId],
    references: [user.id],
  }),
  course: one(courses, { fields: [blocks.courseId], references: [courses.id] }),
  quizQuestions: many(quizQuestions)
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  creator: one(user, {
    fields: [quizzes.createdBy],
    references: [user.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
  course: one(courses, {
    fields: [quizQuestions.courseId],
    references: [courses.id],
  }),
  block: one(blocks, {
    fields: [quizQuestions.blockId],
    references: [blocks.id],
  }),
  answers: many(quizAnswers),
}));

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  course: one(courses, {
    fields: [quizAnswers.courseId],
    references: [courses.id],
  }),
  block: one(blocks, {
    fields: [quizAnswers.blockId],
    references: [blocks.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAnswers.quizId],
    references: [quizzes.id],
  }),
  question: one(quizQuestions, {
    fields: [quizAnswers.questionId],
    references: [quizQuestions.id],
  }),
  attempt: one(quizAttempts, {
    fields: [quizAnswers.attemptId],
    references: [quizAttempts.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(user, { fields: [quizAttempts.userId], references: [user.id] }),
  quiz: one(quizzes, { fields: [quizAttempts.quizId], references: [quizzes.id] }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(user, { fields: [userAchievements.userId], references: [user.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));
