CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"role" varchar(20) DEFAULT 'admin' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
