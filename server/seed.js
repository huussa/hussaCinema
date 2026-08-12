import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./db/index.js";
import { genres, screens, seats } from "./db/schema.js";

const genreData = [
  { name: "Action" },
  { name: "Adventure" },
  { name: "Animation" },
  { name: "Comedy" },
  { name: "Crime" },
  { name: "Documentary" },
  { name: "Drama" },
  { name: "Fantasy" },
  { name: "Horror" },
  { name: "Mystery" },
  { name: "Romance" },
  { name: "Science Fiction" },
  { name: "Thriller" },
  { name: "War" },
  { name: "Western" },
];

async function seed() {
  try {
    await db.insert(genres).values(genreData).onConflictDoNothing();

    const [createdScreen] = await db
      .insert(screens)
      .values({ name: "Screen 1" })
      .onConflictDoNothing()
      .returning();

    const [screen] = createdScreen
      ? [createdScreen]
      : await db
          .select()
          .from(screens)
          .where(eq(screens.name, "Screen 1"))
          .limit(1);

    const seatData = "ABCDEFGHIJ".split("").flatMap((seatRow) =>
      Array.from({ length: 5 }, (_, index) => ({
        screenId: screen.id,
        seatRow,
        seatNumber: index + 1,
        seatClass: "standard",
      })),
    );

    await db.insert(seats).values(seatData).onConflictDoNothing();

    console.log("Genres, Screen 1, and its 50 seats seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  }
}

seed();
