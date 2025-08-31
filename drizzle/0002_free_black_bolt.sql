ALTER TABLE "activities" ALTER COLUMN "createDate" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "createDate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "publishDate" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "updateDate" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "updateDate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "deleteDate" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "createDate" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "createDate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "date" SET DEFAULT now();