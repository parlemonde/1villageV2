ALTER TABLE "classrooms" ADD COLUMN "showOnlyClassroomActivities" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "parentInvitationMessage" jsonb;