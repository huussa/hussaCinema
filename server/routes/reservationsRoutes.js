import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  getShowTimeSeats,
  createReservation,
  getMyReservations,
  cancelReservation,
} from "../controllers/reservations.js";

const router = express.Router();

router.get("/showtimes/:showTimeId/seats", getShowTimeSeats);
router.get("/reservations/me", verifyToken, getMyReservations);

router.post("/reservations/:showTimeId", verifyToken, createReservation);

router.delete("/reservations/:reservationId", verifyToken, cancelReservation);

export default router;
