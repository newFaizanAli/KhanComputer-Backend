CREATE TABLE "letter_heads" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"store_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"header_text" text,
	"footer_text" text,
	"default_body" text,
	"issued_at" timestamp DEFAULT now(),
	"notes" text,
	CONSTRAINT "letter_heads_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DROP TABLE "latter_heads" CASCADE;--> statement-breakpoint
ALTER TABLE "letter_heads" ADD CONSTRAINT "letter_heads_store_id_store_info_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store_info"("id") ON DELETE cascade ON UPDATE no action;