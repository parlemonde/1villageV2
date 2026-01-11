CREATE TABLE "languages" (
	"code" char(2) PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"label_in_language" text NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
