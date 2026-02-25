CREATE TABLE "activity_visibility" (
	"teacherId" uuid NOT NULL,
	"activityId" integer NOT NULL,
	"classroomId" integer NOT NULL,
	"isHidden" boolean DEFAULT false NOT NULL,
	CONSTRAINT "activity_visibility_teacherId_activityId_classroomId_pk" PRIMARY KEY("teacherId","activityId","classroomId")
);
--> statement-breakpoint
CREATE TABLE "classroom_preferences" (
	"user_id" uuid,
	"classroom_id" integer,
	"parent_invitation_message" jsonb,
	CONSTRAINT "classroom_preferences_user_id_classroom_id_pk" PRIMARY KEY("user_id","classroom_id")
);
--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "showOnlyClassroomActivities" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_visibility" ADD CONSTRAINT "activity_visibility_teacherId_users_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_visibility" ADD CONSTRAINT "activity_visibility_activityId_activities_id_fk" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_visibility" ADD CONSTRAINT "activity_visibility_classroomId_classrooms_id_fk" FOREIGN KEY ("classroomId") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom_preferences" ADD CONSTRAINT "classroom_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom_preferences" ADD CONSTRAINT "classroom_preferences_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;