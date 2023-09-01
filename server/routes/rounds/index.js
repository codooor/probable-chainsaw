import express from "express";
import {
  getRounds,
  getRoundById,
  createGolfRound,
  getSingleHoleByRoundId,
} from "../../controllers/rounds.js";
import scoreRoutes from "./score.js";
import teeRoutes from "./tee.js";

const router = express.Router();

router.use("/score", scoreRoutes);
router.use("/tees", teeRoutes);

router.get("/", getRounds).post("/", createGolfRound);
router.get("/:roundId", getRoundById);
router.get("/:roundId/hole/:holeId", getSingleHoleByRoundId);

export default router;
