ALTER TABLE "blocks" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "blocks" DROP COLUMN "video_url";