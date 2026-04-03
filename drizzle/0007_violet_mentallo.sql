ALTER TABLE "quotations" ADD COLUMN "code" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_code_unique" UNIQUE("code");