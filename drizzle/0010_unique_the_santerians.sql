CREATE TABLE "sale_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"customers" integer NOT NULL,
	"store_info" integer NOT NULL,
	"quotations" integer DEFAULT null,
	"order_refrence_no" varchar(20) NOT NULL,
	"gst" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"notes" text DEFAULT '',
	CONSTRAINT "sale_invoices_code_unique" UNIQUE("code"),
	CONSTRAINT "sale_invoices_order_refrence_no_unique" UNIQUE("order_refrence_no")
);
--> statement-breakpoint
CREATE TABLE "sale_invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_invoices" integer NOT NULL,
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
DROP TABLE "purchase_invoices" CASCADE;--> statement-breakpoint
DROP TABLE "purchase_invoice_items" CASCADE;--> statement-breakpoint
ALTER TABLE "sale_invoices" ADD CONSTRAINT "sale_invoices_customers_customers_id_fk" FOREIGN KEY ("customers") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_invoices" ADD CONSTRAINT "sale_invoices_store_info_store_info_id_fk" FOREIGN KEY ("store_info") REFERENCES "public"."store_info"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_invoices" ADD CONSTRAINT "sale_invoices_quotations_quotations_id_fk" FOREIGN KEY ("quotations") REFERENCES "public"."quotations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_invoice_items" ADD CONSTRAINT "sale_invoice_items_sale_invoices_sale_invoices_id_fk" FOREIGN KEY ("sale_invoices") REFERENCES "public"."sale_invoices"("id") ON DELETE cascade ON UPDATE no action;