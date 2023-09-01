import express from "express";
import {
  createAGolfCourse,
  getAllGolfCourses,
  getSingleCourseById,
  deleteAGolfCourseById,
} from "../../controllers/golf-courses.js";
import holeRoutes from "./holes.js";

const router = express.Router();

router.get("/", getAllGolfCourses);
router.post("/", createAGolfCourse);
router.use("/:courseId/holes", holeRoutes);
router
  .get("/:courseId", getSingleCourseById)
  .delete("/:courseId", deleteAGolfCourseById);

export default router;
