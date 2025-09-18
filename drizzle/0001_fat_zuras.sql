ALTER TABLE "activities" ALTER COLUMN "updateDate" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "classrooms" ALTER COLUMN "villageId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;