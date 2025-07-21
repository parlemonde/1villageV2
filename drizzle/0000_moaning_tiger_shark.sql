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
