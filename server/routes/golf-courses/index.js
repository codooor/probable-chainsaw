import express from "express";
import holeRoutes from "./holes.js";
import golfCourseRoutes from "./golf-courses.js";

const router = express.Router();

router.use("/", golfCourseRoutes);
router.use("/:courseId/holes", holeRoutes);

export default router;
