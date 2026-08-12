ALTER TABLE "screens" ADD COLUMN "name" varchar(50);
--> statement-breakpoint
UPDATE "screens" SET "name" = 'Screen ' || "id" WHERE "name" IS NULL;
--> statement-breakpoint
ALTER TABLE "screens" ALTER COLUMN "name" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "screens" ADD CONSTRAINT "screens_name_unique" UNIQUE("name");
