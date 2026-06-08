CREATE TABLE "h5p_content_user_data" (
	"content_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"data_type" text NOT NULL,
	"sub_content_id" text DEFAULT '' NOT NULL,
	"context_id" text DEFAULT '' NOT NULL,
	"user_state" text NOT NULL,
	"preload" boolean DEFAULT false NOT NULL,
	"invalidate" boolean DEFAULT false NOT NULL,
	CONSTRAINT "h5p_content_user_data_content_id_user_id_data_type_sub_content_id_context_id_pk" PRIMARY KEY("content_id","user_id","data_type","sub_content_id","context_id")
);
--> statement-breakpoint
CREATE TABLE "h5p_contents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"metadata" jsonb NOT NULL,
	"parameters" jsonb NOT NULL,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "h5p_finished_data" (
	"content_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"score" integer,
	"max_score" integer,
	"opened_timestamp" integer,
	"finished_timestamp" integer,
	"completion_time" integer,
	CONSTRAINT "h5p_finished_data_content_id_user_id_pk" PRIMARY KEY("content_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "h5p_key_value" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "h5p_libraries" (
	"ubername" text PRIMARY KEY NOT NULL,
	"machine_name" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"additional_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "h5p_content_user_data" ADD CONSTRAINT "h5p_content_user_data_content_id_h5p_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."h5p_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "h5p_contents" ADD CONSTRAINT "h5p_contents_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "h5p_finished_data" ADD CONSTRAINT "h5p_finished_data_content_id_h5p_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."h5p_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_h5p_user_data_user_id" ON "h5p_content_user_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_h5p_user_data_content_id" ON "h5p_content_user_data" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_h5p_finished_data_user_id" ON "h5p_finished_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_h5p_finished_data_content_id" ON "h5p_finished_data" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_h5p_libraries_machine_name" ON "h5p_libraries" USING btree ("machine_name");