CREATE TABLE "store_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"email" varchar(100),
	"phone" varchar(50),
	"ntn" varchar(50),
	"gst_no" varchar(50),
	"notes" text
);
