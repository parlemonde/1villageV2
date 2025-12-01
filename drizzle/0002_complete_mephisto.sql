ALTER TABLE "auth_sessions" ADD COLUMN "impersonated_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_expires" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_impersonated_by_users_id_fk" FOREIGN KEY ("impersonated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;