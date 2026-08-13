import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { genres, movieGenres, movies, showTimes } from "../db/schema.js";
import { createShowTimes } from "./showtimes.js";

function movieValues(body = {}, partial = false) {
  const values = {};
  const allowedFields = ["title", "description", "posterUrl", "trailerUrl", "duration"];

  for (const field of allowedFields) {
    if (body[field] !== undefined) values[field] = body[field];
  }

  if (!partial && (values.title === undefined || values.description === undefined || values.duration === undefined)) {
    return { error: "title, description, and duration are required" };
  }

  if (values.title !== undefined) {
    if (typeof values.title !== "string" || !values.title.trim() || values.title.length > 255) {
      return { error: "Title must be 1-255 characters" };
    }
    values.title = values.title.trim();
  }

  if (values.description !== undefined) {
    if (typeof values.description !== "string" || !values.description.trim()) {
      return { error: "Description is required" };
    }
    values.description = values.description.trim();
  }

  if (values.duration !== undefined) {
    const duration = Number(values.duration);
    if (!Number.isInteger(duration) || duration <= 0) {
      return { error: "Duration must be a positive integer in minutes" };
    }
    values.duration = duration;
  }

  for (const field of ["posterUrl", "trailerUrl"]) {
    if (values[field] !== undefined) {
      if (typeof values[field] !== "string" || !values[field].trim() || values[field].length > 255) {
        return { error: `${field} must be a valid non-empty URL or path` };
      }
      values[field] = values[field].trim();
    }
  }

  return { values };
}

function genreIdsFrom(body = {}, required = false) {
  if (body.genreIds === undefined) {
    return required ? { error: "genreIds is required" } : { genreIds: undefined };
  }

  if (!Array.isArray(body.genreIds) || body.genreIds.length === 0) {
    return { error: "genreIds must be a non-empty array" };
  }

  const genreIds = [...new Set(body.genreIds.map(Number))];
  if (genreIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    return { error: "genreIds must contain positive integer IDs" };
  }

  return { genreIds };
}

async function genresExist(genreIds) {
  const foundGenres = await db.select({ id: genres.id }).from(genres).where(inArray(genres.id, genreIds));
  return foundGenres.length === genreIds.length;
}

async function addGenresToMovies(movieList) {
  if (movieList.length === 0) return [];

  const movieIds = movieList.map((movie) => movie.id);
  const genreRows = await db
    .select({ movieId: movieGenres.movieId, id: genres.id, name: genres.name })
    .from(movieGenres)
    .innerJoin(genres, eq(movieGenres.genreId, genres.id))
    .where(inArray(movieGenres.movieId, movieIds));

  const genresByMovieId = new Map(movieIds.map((id) => [id, []]));
  for (const genre of genreRows) {
    genresByMovieId.get(genre.movieId).push({ id: genre.id, name: genre.name });
  }

  return movieList.map((movie) => ({ ...movie, genres: genresByMovieId.get(movie.id) }));
}

async function movieWithGenres(id) {
  const [movie] = await db.select().from(movies).where(eq(movies.id, id)).limit(1);
  if (!movie) return undefined;

  const [movieWithGenres] = await addGenresToMovies([movie]);
  return movieWithGenres;
}

export const getMovies = async (req, res) => { // any user
  try {
    const movieList = await db.select().from(movies).orderBy(asc(movies.title));
    return res.json({ movies: await addGenresToMovies(movieList) });
  } catch (error) {
    console.error("Fetching movies failed:", error);
    return res.status(500).json({ message: "Unable to fetch movies" });
  }
};

export const getMovieById = async (req, res) => { // any user
  try {
    const movie = await movieWithGenres(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    return res.json({ movie });
  } catch (error) {
    console.error("Fetching movie failed:", error);
    return res.status(500).json({ message: "Unable to fetch movie" });
  }
};

export const createMovie = async (req, res) => { // only admin
  try {
    const { values, error } = movieValues(req.body);
    const { genreIds, error: genreError } = genreIdsFrom(req.body, true);
    if (error || genreError) return res.status(400).json({ message: error || genreError });
    if (!Array.isArray(req.body.showTimes) || req.body.showTimes.length === 0) {
      return res.status(400).json({ message: "showTimes must be a non-empty array" });
    }
    if (!(await genresExist(genreIds))) {
      return res.status(400).json({ message: "One or more genre IDs do not exist" });
    }

    const [movie] = await db.insert(movies).values(values).returning();
    try {
      const showTimeResult = await createShowTimes(movie.id, movie.duration, req.body.showTimes);
      if (showTimeResult.error) {
        await db.delete(movies).where(eq(movies.id, movie.id));
        return res.status(showTimeResult.status || 400).json({ message: showTimeResult.error });
      }

      await db.insert(movieGenres).values(genreIds.map((genreId) => ({ movieId: movie.id, genreId })));
      return res.status(201).json({
        movie: await movieWithGenres(movie.id),
        showTimes: showTimeResult.showTimes,
      });
    } catch (error) {
      await db.delete(movieGenres).where(eq(movieGenres.movieId, movie.id));
      await db.delete(showTimes).where(eq(showTimes.movieId, movie.id));
      await db.delete(movies).where(eq(movies.id, movie.id));
      throw error;
    }
  } catch (error) {
    console.error("Creating movie failed:", error);
    return res.status(500).json({ message: "Unable to create movie" });
  }
};

export const updateMovie = async (req, res) => { // only admin
  try {
    const { values, error } = movieValues(req.body, true);
    const { genreIds, error: genreError } = genreIdsFrom(req.body);
    if (error || genreError) return res.status(400).json({ message: error || genreError });
    if (Object.keys(values).length === 0 && genreIds === undefined) {
      return res.status(400).json({ message: "Provide movie fields or genreIds to update" });
    }
    if (genreIds && !(await genresExist(genreIds))) {
      return res.status(400).json({ message: "One or more genre IDs do not exist" });
    }

    const existingMovie = await movieWithGenres(req.params.id);
    if (!existingMovie) return res.status(404).json({ message: "Movie not found" });

    if (values.duration !== undefined && values.duration !== existingMovie.duration) {
      const [movieShowTime] = await db
        .select({ id: showTimes.id })
        .from(showTimes)
        .where(eq(showTimes.movieId, req.params.id))
        .limit(1);
      if (movieShowTime) {
        return res.status(409).json({ message: "Cannot change duration while the movie has showtimes" });
      }
    }

    if (Object.keys(values).length > 0) {
      await db.update(movies).set(values).where(eq(movies.id, req.params.id));
    }

    if (genreIds) {
      await db.delete(movieGenres).where(eq(movieGenres.movieId, req.params.id));
      await db.insert(movieGenres).values(genreIds.map((genreId) => ({ movieId: req.params.id, genreId })));
    }

    return res.json({ movie: await movieWithGenres(req.params.id) });
  } catch (error) {
    console.error("Updating movie failed:", error);
    return res.status(500).json({ message: "Unable to update movie" });
  }
};

export const deleteMovie = async (req, res) => { // only admin
  try {
    const movie = await movieWithGenres(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const [showTime] = await db
      .select({ id: showTimes.id })
      .from(showTimes)
      .where(eq(showTimes.movieId, req.params.id))
      .limit(1);
    if (showTime) {
      return res.status(409).json({ message: "Movie cannot be deleted while it has showtimes or reservations" });
    }

    await db.delete(movieGenres).where(eq(movieGenres.movieId, req.params.id));
    await db.delete(movies).where(eq(movies.id, req.params.id));

    return res.status(204).send();
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({ message: "Movie cannot be deleted while it has showtimes or reservations" });
    }

    console.error("Deleting movie failed:", error);
    return res.status(500).json({ message: "Unable to delete movie" });
  }
};
