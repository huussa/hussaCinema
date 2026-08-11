import "dotenv/config";
import { db } from "./db/index.js";
import { genres } from "./db/schema.js";

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
    await db
      .insert(genres)
      .values(genreData)
      .onConflictDoNothing();

    console.log("Genres seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();