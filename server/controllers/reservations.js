import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  movies,
  reservationSeats,
  reservations,
  seats,
  showTimes,
} from "../db/schema.js";

function seatIdsFrom(body = {}) {
  if (!Array.isArray(body.seatIds) || body.seatIds.length === 0)
    return { error: "seatIds must be a non-empty array" };
  const seatIds = [...new Set(body.seatIds.map(Number))];
  if (seatIds.some((id) => !Number.isInteger(id) || id <= 0))
    return { error: "seatIds must contain positive integer IDs" };
  return { seatIds };
}

export const getShowTimeSeats = async (req, res) => {
  try {
    const [showTime] = await db
      .select()
      .from(showTimes)
      .where(eq(showTimes.id, req.params.showTimeId))
      .limit(1);
    if (!showTime)
      return res.status(404).json({ message: "Showtime not found" });

    const [screenSeats, reservedSeats] = await Promise.all([
      db
        .select()
        .from(seats)
        .where(eq(seats.screenId, showTime.screenId))
        .orderBy(asc(seats.seatRow), asc(seats.seatNumber)),
      db
        .select({
          seatId: reservationSeats.seatId,
        })
        .from(reservationSeats)
        .innerJoin(
          reservations,
          eq(reservationSeats.reservationId, reservations.id),
        )
        .where(eq(reservations.showTimeId, showTime.id)),
    ]);
    const reservedSeatIds = new Set(reservedSeats.map((seat) => seat.seatId));
    return res.json({
      showTime,
      seats: screenSeats.map((seat) => ({
        ...seat,
        isAvailable: !reservedSeatIds.has(seat.id),
      })),
    });
  } catch (error) {
    console.error("Fetching available seats failed:", error);
    return res.status(500).json({ message: "Unable to fetch seats" });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { seatIds, error } = seatIdsFrom(req.body);
    if (error) return res.status(400).json({ message: error });

    const [showTime] = await db
      .select()
      .from(showTimes)
      .where(eq(showTimes.id, req.params.showTimeId))
      .limit(1);
    if (!showTime)
      return res.status(404).json({ message: "Showtime not found" });
    if (showTime.startTime <= new Date())
      return res.status(400).json({
        message: "Cannot reserve seats for a showtime that has already started",
      });

    const selectedSeats = await db
      .select({ id: seats.id })
      .from(seats)
      .where(
        and(eq(seats.screenId, showTime.screenId), inArray(seats.id, seatIds)),
      );
    if (selectedSeats.length !== seatIds.length)
      return res.status(400).json({
        message: "One or more selected seats do not belong to this screen",
      });

    const reservationId = randomUUID();
    try {
      await db.batch([
        db.insert(reservations).values({
          id: reservationId,
          userId: req.user.id,
          showTimeId: showTime.id,
          status: "confirmed",
        }),
        db.insert(reservationSeats).values(
          seatIds.map((seatId) => ({
            reservationId,
            seatId,
          })),
        ),
      ]);
    } catch (error) {
      if (error.code === "23505")
        return res.status(409).json({
          message:
            "One or more selected seats were just reserved. Refresh and try again.",
        });
      throw error;
    }

    return res.status(201).json({
      reservation: {
        id: reservationId,
        showTimeId: showTime.id,
        status: "confirmed",
        seatIds,
      },
    });
  } catch (error) {
    console.error("Creating reservation failed:", error);
    return res.status(500).json({ message: "Unable to create reservation" });
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const reservationList = await db
      .select({
        id: reservations.id,
        status: reservations.status,
        createdAt: reservations.createdAt,
        showTimeId: showTimes.id,
        startTime: showTimes.startTime,
        movieId: movies.id,
        movieTitle: movies.title,
      })
      .from(reservations)
      .innerJoin(showTimes, eq(reservations.showTimeId, showTimes.id))
      .innerJoin(movies, eq(showTimes.movieId, movies.id))
      .where(eq(reservations.userId, req.user.id))
      .orderBy(asc(showTimes.startTime));
    const reservationIds = reservationList.map((reservation) => reservation.id);
    const selectedSeats = reservationIds.length
      ? await db
          .select({
            reservationId: reservationSeats.reservationId,
            id: seats.id,
            row: seats.seatRow,
            number: seats.seatNumber,
          })
          .from(reservationSeats)
          .innerJoin(seats, eq(reservationSeats.seatId, seats.id))
          .where(inArray(reservationSeats.reservationId, reservationIds))
      : [];
    const seatsByReservation = new Map(reservationIds.map((id) => [id, []]));
    for (const seat of selectedSeats)
      seatsByReservation
        .get(seat.reservationId)
        .push({ id: seat.id, row: seat.row, number: seat.number });
    return res.json({
      reservations: reservationList.map((reservation) => ({
        ...reservation,
        seats: seatsByReservation.get(reservation.id),
      })),
    });
  } catch (error) {
    console.error("Fetching reservations failed:", error);
    return res.status(500).json({ message: "Unable to fetch reservations" });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const [reservation] = await db
      .select({
        id: reservations.id,
        status: reservations.status,
        startTime: showTimes.startTime,
      })
      .from(reservations)
      .innerJoin(showTimes, eq(reservations.showTimeId, showTimes.id))
      .where(
        and(
          eq(reservations.id, req.params.id),
          eq(reservations.userId, req.user.id),
        ),
      )
      .limit(1);
    if (!reservation)
      return res.status(404).json({ message: "Reservation not found" });
    if (reservation.status === "cancelled")
      return res
        .status(409)
        .json({ message: "Reservation is already cancelled" });
    if (reservation.startTime <= new Date())
      return res
        .status(400)
        .json({ message: "Only upcoming reservations can be cancelled" });

    await db.batch([
      db
        .delete(reservationSeats)
        .where(eq(reservationSeats.reservationId, reservation.id)),
      db
        .update(reservations)
        .set({ status: "cancelled" })
        .where(eq(reservations.id, reservation.id)),
    ]);
    return res.status(204).send();
  } catch (error) {
    console.error("Cancelling reservation failed:", error);
    return res.status(500).json({ message: "Unable to cancel reservation" });
  }
};
