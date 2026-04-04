ALTER TABLE "sale_invoices" ADD COLUMN "is_tax_inclusive" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sale_invoices" ADD COLUMN "payment_method" varchar(20) DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE "sale_invoices" ADD COLUMN "payment_reference" varchar(50) DEFAULT '';--> statement-breakpoint
ALTER TABLE "sale_invoices" ADD COLUMN "payment_status" varchar(20) DEFAULT 'unpaid';