import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import verifyToken from "../middleware/verifyToken.js";
import { addShowTime, getShowTimes, updateShowTime, deleteShowTime } from "../controllers/showtimes.js";

const router = express.Router();

router.get("/showtimes", getShowTimes); // any user
router.get("/movies/:movieId/showtimes", getShowTimes); // any user

router.post("/movies/:movieId/showtimes", verifyToken, requireAdmin, addShowTime); // only admin

router.patch("/showtimes/:id", verifyToken, requireAdmin, updateShowTime); // only admin

router.delete("/showtimes/:id", verifyToken, requireAdmin, deleteShowTime); // only admin

export default router;