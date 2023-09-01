import GolfCourse from "../models/GolfCourse.js";

const notFound = (res, message) => res.status(404).json({ message });
const internalServerError = (res, message) => res.status(500).json({ message });
const found = (res, data) => res.status(200).json({ data });
const successfulSave = (res, data) => res.status(201).json({ data });

export const getAllGolfCourses = async (req, res) => {
  try {
    const allGolfCourses = await GolfCourse.find().populate("rounds");

    found(res, allGolfCourses);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params courseId
// @returns a single golf course
export const getSingleCourseById = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const singleCourse = await GolfCourse.findById(courseId).populate("rounds");

    if (!singleCourse) {
      return notFound(res, "Golf course or ID not found.");
    }

    found(res, singleCourse);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

export const createAGolfCourse = async (req, res) => {
  const createGolfCourse = new GolfCourse(req.body);
  try {
    const savedCourse = await createGolfCourse.save();
    successfulSave(res, savedCourse);
  } catch (err) {
    if (err.name === "MongoError" && err.code === 11000) {
      notFound(res, "Course already registered");
    }
    internalServerError(res, err.message);
  }
};

// @params courseId
// @adds a hole to a golf course
export const addHoleToCourseByCourseId = async (req, res) => {
  const courseId = req.params.id;
  try {
    console.log("Payload:", req.body);
    let addingHole = await GolfCourse.findByIdAndUpdate(
      courseId,
      { $push: { holeDetails: req.body } },
      { new: true, runValidators: true }
    );

    console.log("Updated Course:", addingHole);
    if (!addingHole) {
      return notFound(res, `Course with ID: ${courseId} not found.`);
    }
    addingHole = holeAddedSuccess;
    res.json(holeAddedSuccess);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params courseId, holeId
// @deletes a single hole from a golf course
export const deleteAsingleHoleFromCourseById = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const holeId = req.params.holeId;

    const updatedCourse = await GolfCourse.findByIdAndUpdate(
      courseId,
      { $pull: { holeDetails: { _id: holeId } } },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return notFound(res, "Golf course not found.");
    }

    res.json(updatedCourse);
  } catch (err) {
    console.error("Error:", err);
    internalServerError(res, err.message);
  }
};

// @params courseId
// @deletes a golf course
export const deleteAGolfCourseById = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const deleteCourse = await GolfCourse.findByIdAndDelete(courseId);

    if (!deleteCourse) {
      return notFound(res, "No Golf Course with this ID");
    }
    console.log("Deleted course:", deleteCourse.name);
    res.json(deleteCourse);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params courseId, holeId
// @returns a single hole from a golf course
export const getSingleHoleFromGolfCourse = async (req, res) => {
  const { courseId, holeId } = req.params;
  try {
    const course = await GolfCourse.findById(courseId);
    if (!course) return notFound(res, "Golf course not found.");

    const hole = course.holeDetails.id(holeId);
    if (!hole) return notFound(res, "Hole does not exist.");

    const tees = hole.tees;

    found(res, tees);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params courseId
// @returns all holes from a golf course
export const getAllHolesFromGolfCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await GolfCourse.findById(courseId);
    if (!course) return notFound(res, "Golf course not found.");

    const holes = course.holeDetails;

    found(res, holes);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params courseId, holeId
// @returns tee colors from a hole
export const getTeeColorsFromHole = async (req, res) => {
  const { courseId, holeId } = req.params;
  try {
    const course = await GolfCourse.findById(courseId);
    if (!course) return notFound(res, "Golf course not found.");

    const hole = course.holeDetails.id(holeId);
    if (!hole) return notFound(res, "Hole does not exist.");

    const teeColors = hole.tees.map((tee) => tee.color);

    found(res, teeColors);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params courseId, teeColor
// @returns tee details from a hole
export const getAllTeeDetailsByColor = async (req, res) => {
  const { courseId } = req.params;
  const teeColor = req.params.teeColor.toLowerCase();

  try {
    const course = await GolfCourse.findById(courseId);
    if (!course) return notFound(res, "Golf course not found.");

    const teeDetailsForAllHoles = [];

    course.holeDetails.forEach((courseHole) => {
      let foundMatchingTee = courseHole.tees.find(
        (tee) => tee.color.toLowerCase() === teeColor
      );
      if (foundMatchingTee) {
        foundMatchingTee = matchedSuccess;
        teeDetailsForAllHoles.push({
          holeNumber: courseHole.holeNumber,
          teeDetail: matchedSuccess,
        });
      }
    });

    if (teeDetailsForAllHoles.length === 0) {
      return notFound(
        res,
        `Tee color ${teeColor} not available for this course.`
      );
    }

    found(res, teeDetailsForAllHoles);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params courseId , holeId
// @updates a single hole on a golf course by id
export const updateSingleHoleByCourseId = async (req, res) => {
  const { courseId, holeId } = req.params;
  const updatedTees = req.body.tees;

  try {
    const course = await GolfCourse.findById(courseId);
    if (!course) return notFound(res, "Course Not Registered");

    const hole = course.holeDetails.id(holeId);
    if (!hole) return notFound(res, "No Hole associated with this course");

    let updatedDetails = [];

    updatedTees.forEach((updatedTee) => {
      const teeInHole = hole.tees.id(updatedTee._id);
      if (teeInHole) {
        let teeDetails = { _id: updatedTee._id };

        if (updatedTee.color) {
          teeInHole.color = updatedTee.color;
          teeDetails.color = updatedTee.color;
        }

        if (typeof updatedTee.par !== "undefined") {
          teeInHole.par = updatedTee.par;
          teeDetails.par = updatedTee.par;
        }

        if (typeof updatedTee.length !== "undefined") {
          teeInHole.length = updatedTee.length;
          teeDetails.length = updatedTee.length;
        }

        if (typeof updatedTee.handicap !== "undefined") {
          teeInHole.handicap = updatedTee.handicap;
          teeDetails.handicap = updatedTee.handicap;
        }

        updatedDetails.push(teeDetails);
      }
    });

    await course.save();
    successfulSave(res, updatedDetails);
  } catch (err) {
    internalServerError(res, err.message);
  }
};
