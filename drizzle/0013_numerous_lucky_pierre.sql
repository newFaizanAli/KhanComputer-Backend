ALTER TABLE "store_info" ADD COLUMN "quotation_notes" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "store_info" ADD COLUMN "sale_invoice_notes" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "sale_invoices" DROP COLUMN "quotation_notes";--> statement-breakpoint
ALTER TABLE "sale_invoices" DROP COLUMN "sale_invoice_notes";