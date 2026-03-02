CREATE TABLE "parents_students" (
	"parentId" uuid NOT NULL,
	"studentId" integer NOT NULL,
	CONSTRAINT "parents_students_parentId_studentId_pk" PRIMARY KEY("parentId","studentId")
);
--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_parentId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "parents_students" ADD CONSTRAINT "parents_students_parentId_users_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents_students" ADD CONSTRAINT "parents_students_studentId_students_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inviteCode_idx" ON "students" USING btree ("inviteCode");--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "parentId";