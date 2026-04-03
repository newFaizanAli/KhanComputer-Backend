CREATE TABLE "buyers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"address" varchar(100) NOT NULL,
	"phone" varchar(100) NOT NULL,
	"gst" varchar(100) NOT NULL,
	"ntn" varchar(100) NOT NULL,
	CONSTRAINT "buyers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "suppliers" CASCADE;