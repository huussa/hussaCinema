CREATE TABLE "login_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "code_hash" varchar(255) NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "login_codes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "login_codes"
  ADD CONSTRAINT "login_codes_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;
