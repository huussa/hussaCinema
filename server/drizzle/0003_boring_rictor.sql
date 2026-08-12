CREATE TABLE "login_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "login_codes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "reservation_seats" DROP CONSTRAINT "reservation_seats_reservation_id_seat_id_pk";--> statement-breakpoint
ALTER TABLE "screens" ADD COLUMN "name" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "login_codes" ADD CONSTRAINT "login_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screens" ADD CONSTRAINT "screens_name_unique" UNIQUE("name");