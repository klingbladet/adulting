ALTER TABLE "blocks" DROP CONSTRAINT "blocks_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "user_courses" DROP CONSTRAINT "user_courses_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;