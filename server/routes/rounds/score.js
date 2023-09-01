import express from "express";
import {
  updateHoleScoreFromRoundId,
  addScoreToRoundId,
  updateOverallRoundScores,
} from "../../controllers/rounds.js";

const router = express.Router();

router.put("/:roundId/hole/:holeId", updateHoleScoreFromRoundId);
router.put("/:roundId/score", addScoreToRoundId);
router.put("/:roundId/overallScores", updateOverallRoundScores);

export default router;
