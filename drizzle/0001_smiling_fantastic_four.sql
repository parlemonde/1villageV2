ALTER TABLE "activities" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "level" varchar(150);--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "city" varchar(150) NOT NULL;