import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { screens, seats } from "../db/schema.js";

export const getScreens = async (_req, res) => {
  try {
    const screenList = await db.select().from(screens).orderBy(asc(screens.id));
    return res.json({ screens: screenList });
  } catch (error) {
    console.error("Fetching screens failed:", error);
    return res.status(500).json({ message: "Unable to fetch screens" });
  }
};

export const getScreenSeats = async (req, res) => {
  try {
    const screenId = Number(req.params.screenId);
    if (!Number.isInteger(screenId) || screenId <= 0) {
      return res.status(400).json({ message: "Screen ID must be a positive integer" });
    }

    const [screen] = await db.select().from(screens).where(eq(screens.id, screenId)).limit(1);
    if (!screen) return res.status(404).json({ message: "Screen not found" });

    const screenSeats = await db
      .select()
      .from(seats)
      .where(eq(seats.screenId, screenId))
      .orderBy(asc(seats.seatRow), asc(seats.seatNumber));

    return res.json({ screen, seats: screenSeats });
  } catch (error) {
    console.error("Fetching screen seats failed:", error);
    return res.status(500).json({ message: "Unable to fetch seats" });
  }
};
