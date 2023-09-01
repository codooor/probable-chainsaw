import express from "express";
import {
  addHoleToCourseByCourseId,
  getSingleHoleFromGolfCourse,
  deleteAsingleHoleFromCourseById,
  getAllHolesFromGolfCourse,
  getTeeColorsFromHole,
  getAllTeeDetailsByColor,
  updateSingleHoleByCourseId,
} from "../../controllers/golf-courses.js";

const router = express.Router({ mergeParams: true });

// Specific
router.get("/:holeId/tee-colors", getTeeColorsFromHole);
router.get("/tee/:teeColor", getAllTeeDetailsByColor);
router.get("/:holeId", getSingleHoleFromGolfCourse);
router.put("/:holeId", updateSingleHoleByCourseId);
router.delete("/:holeId", deleteAsingleHoleFromCourseById);

// General
router.get("/", getAllHolesFromGolfCourse);
router.post("/", addHoleToCourseByCourseId);

export default router;
