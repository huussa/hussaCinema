import {
  pgTable,
  pgEnum,
  uuid,
  serial,
  integer,
  varchar,
  char,
  text,
  timestamp,
  date,
  boolean,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const seatClassEnum = pgEnum("seat_class", ["standard", "premium"]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

/* 
=========================
   USERS
========================= 
*/
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  profilePicture: varchar("profile_picture", {
    length: 255,
  }).default("/default-profile.png"),

  username: varchar("username", {
    length: 255,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  })
    .notNull()
    .unique(),

  password: varchar("password", {
    length: 255,
  }).notNull(),

  birthdate: date("birthdate").notNull(),

  gender: varchar("gender", {
    length: 10,
  }).default("other"),

  role: roleEnum("role").default("user").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/*
=========================
   PASSWORDLESS LOGIN CODES
=========================
*/
export const loginCodes = pgTable("login_codes", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),

  codeHash: varchar("code_hash", { length: 255 }).notNull(),

  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* 
=========================
   MOVIES
========================= 
*/
export const movies = pgTable("movies", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  description: text("description").notNull(),

  posterUrl: varchar("poster_url", {
    length: 255,
  }).default("/default-img.png"),

  trailerUrl: varchar("trailer_url", {
    length: 255,
  }).default("/default-video.mp4"),

  duration: integer("duration").notNull(),
});

/* 
=========================
   GENRES
========================= 
*/
export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 255,
  })
    .notNull()
    .unique(),
});

/* 
=========================
   MOVIE ↔ GENRE
========================= 
*/
export const movieGenres = pgTable(
  "movie_genres",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id),

    genreId: integer("genre_id")
      .notNull()
      .references(() => genres.id),
  },
  (table) => [
    primaryKey({
      columns: [table.movieId, table.genreId],
    }),
  ],
);

/* =========================
   SCREENS
========================= */
export const screens = pgTable("screens", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

/* =========================
   SEATS
========================= */
export const seats = pgTable(
  "seats",
  {
    id: serial("id").primaryKey(),

    screenId: integer("screen_id")
      .notNull()
      .references(() => screens.id),

    seatRow: char("seat_row", {
      length: 1,
    }).notNull(),

    seatNumber: integer("seat_number").notNull(),

    seatClass: seatClassEnum("seat_class").default("standard").notNull(),
  },
  (table) => [unique().on(table.screenId, table.seatRow, table.seatNumber)],
);

/* =========================
   SHOWTIMES
========================= */
export const showTimes = pgTable("show_times", {
  id: uuid("id").primaryKey().defaultRandom(),

  movieId: uuid("movie_id")
    .notNull()
    .references(() => movies.id),

  screenId: integer("screen_id")
    .notNull()
    .references(() => screens.id),

  startTime: timestamp("start_time").notNull(),
});

/* =========================
   RESERVATIONS
========================= */
export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  showTimeId: uuid("show_time_id")
    .notNull()
    .references(() => showTimes.id),

  status: reservationStatusEnum("status").default("pending").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* 
=========================
   RESERVATION ↔ SEAT
========================= 
*/
export const reservationSeats = pgTable("reservation_seats", {
  reservationId: uuid("reservation_id")
    .notNull()
    .references(() => reservations.id),

  seatId: integer("seat_id")
    .notNull()
    .references(() => seats.id),
});
