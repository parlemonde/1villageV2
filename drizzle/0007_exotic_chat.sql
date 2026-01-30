CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"activityId" integer,
	"content" jsonb,
	"createDate" timestamp with time zone DEFAULT now() NOT NULL,
	"updateDate" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_activityId_activities_id_fk" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;