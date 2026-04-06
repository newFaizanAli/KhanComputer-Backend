CREATE TABLE "latter_heads" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"header_text" text,
	"footer_text" text,
	"default_body" text,
	"issued_at" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
DROP TABLE "official_letter_templates" CASCADE;--> statement-breakpoint
ALTER TABLE "latter_heads" ADD CONSTRAINT "latter_heads_store_id_store_info_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store_info"("id") ON DELETE cascade ON UPDATE no action;