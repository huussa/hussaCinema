import { and, asc, eq, gte, inArray, lt } from "drizzle-orm";

import { db } from "../db/index.js";
import { movies, screens, showTimes } from "../db/schema.js";

function scheduleValues(body = {}) {
  const screenId = Number(body.screenId);
  const startTime = new Date(body.startTime);

  if (!Number.isInteger(screenId) || screenId <= 0) {
    return {
      error: "screenId must be a positive integer",
    };
  }

  if (!body.startTime || Number.isNaN(startTime.getTime())) {
    return {
      error: "startTime must be a valid ISO date-time",
    };
  }

  if (startTime <= new Date()) {
    return {
      error: "startTime must be in the future",
    };
  }

  return {
    values: {
      screenId,
      startTime,
    },
  };
}

function endTimeFor(startTime, duration) {
  return new Date(new Date(startTime).getTime() + duration * 60 * 1000);
}

async function screenExists(screenId) {
  const [screen] = await db
    .select({
      id: screens.id,
    })
    .from(screens)
    .where(eq(screens.id, screenId))
    .limit(1);

  return Boolean(screen);
}

/*
  Checks whether two showtimes overlap.

  first:
    startTime
    endTime

  second:
    startTime
    endTime
*/
function showtimesOverlap(first, second) {
  return (
    first.screenId === second.screenId &&
    first.startTime < second.endTime &&
    first.endTime > second.startTime
  );
}

/*
  Get existing showtimes for specific screens.

  We join movies because the movie duration is needed
  to calculate each existing show's end time.
*/
async function getExistingShowTimes(screenIds, excludeShowTimeId = null) {
  const existing = await db
    .select({
      id: showTimes.id,
      movieId: showTimes.movieId,
      screenId: showTimes.screenId,
      startTime: showTimes.startTime,
      duration: movies.duration,
    })
    .from(showTimes)
    .innerJoin(movies, eq(showTimes.movieId, movies.id))
    .where(inArray(showTimes.screenId, screenIds));

  return existing
    .filter((showTime) => {
      if (!excludeShowTimeId) {
        return true;
      }

      return showTime.id !== excludeShowTimeId;
    })
    .map((showTime) => ({
      id: showTime.id,
      movieId: showTime.movieId,
      screenId: showTime.screenId,
      startTime: new Date(showTime.startTime),
      endTime: endTimeFor(showTime.startTime, showTime.duration),
    }));
}

/*
  Check a list of new showtimes against each other.
*/
function findOverlapBetweenNewShowtimes(showtimes) {
  for (let i = 0; i < showtimes.length; i += 1) {
    for (let j = i + 1; j < showtimes.length; j += 1) {
      const first = showtimes[i];
      const second = showtimes[j];

      if (showtimesOverlap(first, second)) {
        return true;
      }
    }
  }

  return false;
}

/*
  Check new showtimes against showtimes already stored
  in the database.
*/
function findOverlapWithExisting(newShowtimes, existingShowtimes) {
  for (const newShowtime of newShowtimes) {
    for (const existingShowtime of existingShowtimes) {
      if (showtimesOverlap(newShowtime, existingShowtime)) {
        return true;
      }
    }
  }

  return false;
}

/* =========================================================
   Create Showtimes
========================================================= */

export async function createShowTimes(movieId, duration, schedules) {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return {
      error: "showTimes must be a non-empty array",
    };
  }

  /*
    Parse and validate all schedules first.
  */
  const parsed = [];

  for (const schedule of schedules) {
    const { values, error } = scheduleValues(schedule);

    if (error) {
      return { error };
    }

    parsed.push(values);
  }

  /*
    Check that all referenced screens exist.
  */
  const screenIds = [...new Set(parsed.map((schedule) => schedule.screenId))];

  const existingScreens = await db
    .select({
      id: screens.id,
    })
    .from(screens)
    .where(inArray(screens.id, screenIds));

  if (existingScreens.length !== screenIds.length) {
    return {
      error: "One or more screen IDs do not exist",
    };
  }

  /*
    Calculate endTime in memory only.
    It is NOT stored in the database.
  */
  const scheduled = parsed
    .map((schedule) => ({
      ...schedule,
      movieId,
      endTime: endTimeFor(schedule.startTime, duration),
    }))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  /*
    Check overlap between the new showtimes themselves.
  */
  if (findOverlapBetweenNewShowtimes(scheduled)) {
    return {
      error: "Showtimes for the same screen cannot overlap",
    };
  }

  /*
    Get existing showtimes from database and compare.
  */
  const existingShowtimes = await getExistingShowTimes(screenIds);

  if (findOverlapWithExisting(scheduled, existingShowtimes)) {
    return {
      error: "This showtime overlaps with another showtime in the same screen",
      status: 409,
    };
  }

  /*
    Remove endTime before inserting because it is not
    a column in the database.
  */
  const valuesToInsert = scheduled.map(({ endTime, ...schedule }) => schedule);

  try {
    const inserted = await db
      .insert(showTimes)
      .values(valuesToInsert)
      .returning();

    return {
      showTimes: inserted,
    };
  } catch (error) {
    throw error;
  }
}

/* =========================================================
   Get Showtimes
========================================================= */

export const getShowTimes = async (req, res) => {
  try {
    const date = req.query.date;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Provide date as YYYY-MM-DD",
      });
    }

    const startOfDay = new Date(`${date}T00:00:00`);

    const nextDay = new Date(startOfDay);

    nextDay.setDate(nextDay.getDate() + 1);

    const filters = [
      gte(showTimes.startTime, startOfDay),
      lt(showTimes.startTime, nextDay),
    ];

    /*
      If movieId exists in the route,
      only return showtimes for that movie.
    */
    if (req.params.movieId) {
      filters.push(eq(showTimes.movieId, req.params.movieId));
    }

    const schedule = await db
      .select({
        id: showTimes.id,
        startTime: showTimes.startTime,

        screenId: screens.id,
        screenName: screens.name,

        movieId: movies.id,
        movieTitle: movies.title,
        duration: movies.duration,
      })
      .from(showTimes)
      .innerJoin(movies, eq(showTimes.movieId, movies.id))
      .innerJoin(screens, eq(showTimes.screenId, screens.id))
      .where(and(...filters))
      .orderBy(asc(showTimes.startTime));

    return res.json({
      showTimes: schedule,
    });
  } catch (error) {
    console.error("Fetching showtimes failed:", error);

    return res.status(500).json({
      message: "Unable to fetch showtimes",
    });
  }
};

/* =========================================================
   Add Showtime
========================================================= */

export const addShowTime = async (req, res) => {
  try {
    /*
      Make sure the movie exists.
    */
    const [movie] = await db
      .select()
      .from(movies)
      .where(eq(movies.id, req.params.movieId))
      .limit(1);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    /*
      createShowTimes handles:
      - validation
      - screen existence
      - overlap checking
      - insertion
    */
    const result = await createShowTimes(movie.id, movie.duration, [req.body]);

    if (result.error) {
      return res.status(result.status || 400).json({
        message: result.error,
      });
    }

    return res.status(201).json({
      showTime: result.showTimes[0],
    });
  } catch (error) {
    console.error("Adding showtime failed:", error);

    return res.status(500).json({
      message: "Unable to add showtime",
    });
  }
};

/* =========================================================
   Update Showtime
========================================================= */

export const updateShowTime = async (req, res) => {
  try {
    /*
      Get current showtime.
    */
    const [current] = await db
      .select()
      .from(showTimes)
      .where(eq(showTimes.id, req.params.id))
      .limit(1);

    if (!current) {
      return res.status(404).json({
        message: "Showtime not found",
      });
    }

    /*
      Get the movie because we need its duration
      to calculate the new end time.
    */
    const [movie] = await db
      .select()
      .from(movies)
      .where(eq(movies.id, current.movieId))
      .limit(1);

    if (!movie) {
      return res.status(500).json({
        message: "Movie associated with showtime was not found",
      });
    }

    /*
      PATCH behavior:
      if a field isn't provided, keep the old value.
    */
    const { values, error } = scheduleValues({
      screenId: req.body.screenId ?? current.screenId,

      startTime: req.body.startTime ?? current.startTime,
    });

    if (error) {
      return res.status(400).json({
        message: error,
      });
    }

    /*
      Check screen exists.
    */
    if (!(await screenExists(values.screenId))) {
      return res.status(400).json({
        message: "Screen does not exist",
      });
    }

    /*
      Build the updated showtime in memory.
    */
    const updatedShowtime = {
      id: current.id,
      movieId: current.movieId,
      screenId: values.screenId,
      startTime: values.startTime,
      endTime: endTimeFor(values.startTime, movie.duration),
    };

    /*
      Get all other showtimes in the target screen.
      IMPORTANT:
      exclude current showtime so it doesn't conflict with itself.
    */
    const existingShowtimes = await getExistingShowTimes(
      [values.screenId],
      current.id,
    );

    /*
      Check overlap.
    */
    if (findOverlapWithExisting([updatedShowtime], existingShowtimes)) {
      return res.status(409).json({
        message:
          "This showtime overlaps with another showtime in the same screen",
      });
    }
    const [showTime] = await db
      .update(showTimes)
      .set({
        screenId: values.screenId,
        startTime: values.startTime,
      })
      .where(eq(showTimes.id, current.id))
      .returning();

    return res.json({
      showTime,
    });
  } catch (error) {
    console.error("Updating showtime failed:", error);

    return res.status(500).json({
      message: "Unable to update showtime",
    });
  }
};

/* =========================================================
   Delete Showtime
========================================================= */

export const deleteShowTime = async (req, res) => {
  try {
    const [showTime] = await db
      .delete(showTimes)
      .where(eq(showTimes.id, req.params.id))
      .returning();

    if (!showTime) {
      return res.status(404).json({
        message: "Showtime not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    /*
      PostgreSQL foreign key violation.
      This happens if reservations still reference
      this showtime.
    */
    if (error.code === "23503") {
      return res.status(409).json({
        message: "Showtime cannot be deleted while it has reservations",
      });
    }

    console.error("Deleting showtime failed:", error);

    return res.status(500).json({
      message: "Unable to delete showtime",
    });
  }
};
