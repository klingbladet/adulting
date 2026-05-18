CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."quiz_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."quiz_type" AS ENUM('diagnostic', 'practice', 'review');--> statement-breakpoint
CREATE TABLE "quiz_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"block_id" integer NOT NULL,
	"selected_option_id" varchar(1) NOT NULL,
	"is_correct" boolean NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"block_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"created_by" text,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_id" varchar(1) NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_block_id_blocks_id_fk";
--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "quiz_eligible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "course_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "type" "quiz_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "status" "quiz_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "generated_by_ai" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "block_id";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "question_text";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "correct_answer";