CREATE TABLE "activity_visibility" (
	"teacherId" uuid NOT NULL,
	"activityId" integer NOT NULL,
	"classroomId" integer NOT NULL,
	"isHidden" boolean DEFAULT false NOT NULL,
	CONSTRAINT "activity_visibility_teacherId_activityId_classroomId_pk" PRIMARY KEY("teacherId","activityId","classroomId")
);
--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "showOnlyClassroomActivities" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_visibility" ADD CONSTRAINT "activity_visibility_teacherId_users_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_visibility" ADD CONSTRAINT "activity_visibility_activityId_activities_id_fk" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_visibility" ADD CONSTRAINT "activity_visibility_classroomId_classrooms_id_fk" FOREIGN KEY ("classroomId") REFERENCES "public"."classrooms"("id") ON DELETE no action ON UPDATE no action;