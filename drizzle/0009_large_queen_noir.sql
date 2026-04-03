ALTER TABLE "purchase_invoices" DROP CONSTRAINT "purchase_invoices_quotations_quotations_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_invoices" ADD COLUMN "purchase_invoice_items" integer DEFAULT null;--> statement-breakpoint
ALTER TABLE "purchase_invoices" ADD CONSTRAINT "purchase_invoices_purchase_invoice_items_purchase_invoice_items_id_fk" FOREIGN KEY ("purchase_invoice_items") REFERENCES "public"."purchase_invoice_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_invoices" DROP COLUMN "quotations";