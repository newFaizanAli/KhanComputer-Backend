ALTER TABLE "latter_heads" ADD COLUMN "code" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "latter_heads" ADD CONSTRAINT "latter_heads_code_unique" UNIQUE("code");