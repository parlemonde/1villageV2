CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(20) NOT NULL,
	"phase" smallint NOT NULL,
	"isPelico" boolean DEFAULT false NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"classroomId" integer,
	"userId" integer,
	"villageId" integer,
	"createDate" timestamp DEFAULT now() NOT NULL,
	"publishDate" timestamp,
	"updateDate" timestamp DEFAULT now() NOT NULL,
	"deleteDate" timestamp,
	"content" jsonb,
	"draftUrl" varchar(300),
	"parentActivityId" integer,
	"responseActivityId" integer
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"address" varchar(300) NOT NULL,
	"coordinates" jsonb,
	"avatarUrl" varchar(300),
	"teacherId" integer NOT NULL,
	"villageId" integer NOT NULL,
	"countryCode" varchar(2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createDate" timestamp DEFAULT now() NOT NULL,
	"userId" integer NOT NULL,
	"type" char(5) NOT NULL,
	"url" varchar(300) NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"userId" integer NOT NULL,
	"durationSeconds" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"teacherId" integer NOT NULL,
	"parentId" integer,
	"classroomId" integer NOT NULL,
	"inviteCode" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"plmId" integer,
	"email" varchar(150) NOT NULL,
	"name" varchar(150) NOT NULL,
	"passwordHash" char(100),
	"verificationHash" char(100),
	"accountRegistration" smallint DEFAULT 0 NOT NULL,
	"role" varchar(20) DEFAULT 'teacher' NOT NULL,
	CONSTRAINT "users_plmId_unique" UNIQUE("plmId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "villages" (
	"id" serial PRIMARY KEY NOT NULL,
	"plmId" integer,
	"name" varchar(150) NOT NULL,
	"countries" jsonb NOT NULL,
	"activePhase" smallint NOT NULL,
	"phaseStartDates" jsonb NOT NULL,
	"classroomCount" jsonb NOT NULL,
	CONSTRAINT "villages_plmId_unique" UNIQUE("plmId")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_classroomId_classrooms_id_fk" FOREIGN KEY ("classroomId") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_villageId_villages_id_fk" FOREIGN KEY ("villageId") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_parentActivityId_activities_id_fk" FOREIGN KEY ("parentActivityId") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_responseActivityId_activities_id_fk" FOREIGN KEY ("responseActivityId") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_teacherId_users_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_villageId_villages_id_fk" FOREIGN KEY ("villageId") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medias" ADD CONSTRAINT "medias_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_teacherId_users_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_parentId_users_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_classroomId_classrooms_id_fk" FOREIGN KEY ("classroomId") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;