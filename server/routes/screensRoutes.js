import express from "express";
import { getScreens, getScreenSeats } from "../controllers/screens.js";

const router = express.Router();

router.get("/screens", getScreens);
router.get("/screens/:screenId/seats", getScreenSeats);

export default router;
