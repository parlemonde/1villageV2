CREATE TABLE "user_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"parent_invitation_message" jsonb
);
--> statement-breakpoint
ALTER TABLE "activity_visibility" DROP CONSTRAINT "activity_visibility_activityId_activities_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_visibility" DROP CONSTRAINT "activity_visibility_classroomId_classrooms_id_fk";
--> statement-breakpoint
ALTER TABLE "classrooms" ALTER COLUMN "showOnlyClassroomActivities" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_visibility" ADD CONSTRAINT "activity_visibility_activityId_activities_id_fk" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_visibility" ADD CONSTRAINT "activity_visibility_classroomId_classrooms_id_fk" FOREIGN KEY ("classroomId") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;