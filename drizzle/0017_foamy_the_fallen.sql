CREATE TABLE "official_letter_templates" (
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
ALTER TABLE "official_letter_templates" ADD CONSTRAINT "official_letter_templates_store_id_store_info_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store_info"("id") ON DELETE cascade ON UPDATE no action;