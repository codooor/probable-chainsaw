import express from "express";
import { selectedTeeColor } from "../../controllers/rounds.js";

const router = express.Router();

router.put("/:roundId/tee", selectedTeeColor);

export default router;
