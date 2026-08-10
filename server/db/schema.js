import { char, serial } from "drizzle-orm/mysql-core";
import {
  pgTable,
  uuid,
  serial,
  integer,
  varchar,
  char,
  text,
  timestamp,
  pgenum,
} from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["user", "admin"]);
export const sClass = pgEnum("class", ["standard", "premium"]);
export const statusEnum = pgEnum("status", ["pending", "confirmed", "cancelled"]);


export const users = pgTable("users", {
    id: uuid("id").primarykey().defaultRandom(),

    username: varchar("username", { length: 255 }).notNull(),

    email: varchar("email", { length: 255 }).notNull().unique(),

    password: varchar("password", { length: 255 }).notNull(),

    birthdate: timestamp("birthdate").notNull(),

    gender: varchar("gender", { length: 10 }).default("other"),

    role: role("role").default("user").notNull(),

    createdAt: timestamp("created_at").defaultNow()
});

export const movies = pgTable("movies", {
    id: uuid("id").primaryKey().defaultRandom(),

    title: varchar("title", { length: 255 }).notNull(),

    description: text("description").notNull(),

    posterUrl: varchar("poster_url", { length: 255 }).notNull(),

    trailerUrl: varchar("trailer_url", { length: 255 }).notNull(),

    duration: integer("duration").notNull()
})

export const genres = pgTable("genres", {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 255 }).notNull().unique()
})

export const movieGenres = pgTable("movie_genres", {
    movieId: uuid("movie_id").notNull().references(() => movies.id),

    genreId: integer("genre_id").notNull().references(() => genres.id),

    primaryKey: ["movieId", "genreId"]
})

export const screens = pgTable("screens", {
    id: serial("id").primaryKey(),
})

export const seats = pgTable("seats", {
    id: serial("id").primaryKey(),

    screenId: serial("screen_id").notNull().references(() => screens.id),

    seatRow: char("seat_row").notNull(),

    seatNumber: varchar("seat_number", { length: 10 }).notNull(),

    seatClass: sClass("seat_class").default("standard").notNull(),

    isAvailable: boolean("is_available").default(true)
})

export const showTimes = pgTable("show_times", {
    id: uuid("id").primaryKey().defaultRandom(),

    movieId: uuid("movie_id").notNull().references(() => movies.id),

    screenId: serial("screen_id").notNull().references(() => screens.id),

    startTime: timestamp("start_time").notNull(),

    availableSeats: integer("available_seats").notNull()
})

export const reservations = pgTable("reservations", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id").notNull().references(() => users.id),

    showTimeId: uuid("show_time_id").notNull().references(() => showTimes.id),

    seatId: serial("seat_id").notNull().references(() => seats.id),

    status: statusEnum("status").default("pending"),

    createdAt: timestamp("created_at").defaultNow()
})