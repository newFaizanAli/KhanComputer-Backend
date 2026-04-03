ALTER TABLE "sale_invoices" DROP CONSTRAINT "sale_invoices_order_reference_no_unique";--> statement-breakpoint
ALTER TABLE "sale_invoices" ALTER COLUMN "order_reference_no" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "sale_invoices" ALTER COLUMN "order_reference_no" DROP NOT NULL;