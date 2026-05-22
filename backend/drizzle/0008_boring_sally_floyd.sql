DROP TABLE IF EXISTS "quiz_answers" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "quiz_attempts" CASCADE;
--> statement-breakpoint

CREATE TABLE "quiz_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "course_id" integer NOT NULL,
  "quiz_id" integer NOT NULL,
  "status" varchar(50) DEFAULT 'completed' NOT NULL,
  "score" integer DEFAULT 0 NOT NULL,
  "max_score" integer DEFAULT 0 NOT NULL,
  "completed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

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

ALTER TABLE "quiz_attempts"
ADD CONSTRAINT "quiz_attempts_user_id_user_id_fk"
FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_attempts"
ADD CONSTRAINT "quiz_attempts_course_id_courses_id_fk"
FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_attempts"
ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk"
FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_answers"
ADD CONSTRAINT "quiz_answers_attempt_id_quiz_attempts_id_fk"
FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_answers"
ADD CONSTRAINT "quiz_answers_question_id_quiz_questions_id_fk"
FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_answers"
ADD CONSTRAINT "quiz_answers_quiz_id_quizzes_id_fk"
FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_answers"
ADD CONSTRAINT "quiz_answers_course_id_courses_id_fk"
FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_answers"
ADD CONSTRAINT "quiz_answers_block_id_blocks_id_fk"
FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id")
ON DELETE cascade ON UPDATE no action;