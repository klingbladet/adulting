ALTER TABLE "blocks" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "video_url" varchar(255);--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "video_url";