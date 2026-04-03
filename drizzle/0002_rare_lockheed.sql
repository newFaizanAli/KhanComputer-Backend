CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"address" varchar(100) NOT NULL,
	"phone" varchar(100) NOT NULL,
	"gst" varchar(100) NOT NULL,
	"ntn" varchar(100) NOT NULL,
	CONSTRAINT "suppliers_email_unique" UNIQUE("email")
);
