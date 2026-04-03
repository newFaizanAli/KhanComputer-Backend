CREATE TABLE "quotations" (
	"id" serial PRIMARY KEY NOT NULL,
	"customers" integer DEFAULT null,
	"store_info" integer NOT NULL,
	"gst" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '',
	"valid_until" timestamp,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotation_id" integer NOT NULL,
	"description" varchar(100) NOT NULL,
	"quantity" numeric(12, 2) DEFAULT 1 NOT NULL,
	"uom" varchar(50) NOT NULL,
	"price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"gst" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total" numeric(12, 2) DEFAULT 0 NOT NULL,
	"notes" text DEFAULT ''
);
--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customers_customers_id_fk" FOREIGN KEY ("customers") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_store_info_store_info_id_fk" FOREIGN KEY ("store_info") REFERENCES "public"."store_info"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;