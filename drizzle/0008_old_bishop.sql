CREATE TABLE "game_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"gameId" integer NOT NULL,
	"questionId" integer NOT NULL,
	"classroomId" integer NOT NULL,
	"sessionId" serial NOT NULL,
	"response" text,
	"createDate" timestamp with time zone DEFAULT now() NOT NULL,
	"updateDate" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "game_responses_gameId_questionId_classroomId_index" ON "game_responses" USING btree ("gameId","questionId","classroomId");