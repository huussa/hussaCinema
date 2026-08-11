import express from "express";
import {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  updateMovie,
} from "../controllers/movies.js";
import requireAdmin from "../middleware/requireAdmin.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/movies", getMovies);
router.get("/movies/:id", getMovieById);

router.post("/movies", verifyToken, requireAdmin, createMovie);
router.patch("/movies/:id", verifyToken, requireAdmin, updateMovie);
router.delete("/movies/:id", verifyToken, requireAdmin, deleteMovie);

export default router;
