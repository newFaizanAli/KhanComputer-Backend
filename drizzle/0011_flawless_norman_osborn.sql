ALTER TABLE "sale_invoices" DROP CONSTRAINT "sale_invoices_order_refrence_no_unique";--> statement-breakpoint
ALTER TABLE "sale_invoices" ADD COLUMN "order_reference_no" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_invoices" DROP COLUMN "order_refrence_no";--> statement-breakpoint
ALTER TABLE "sale_invoices" ADD CONSTRAINT "sale_invoices_order_reference_no_unique" UNIQUE("order_reference_no");