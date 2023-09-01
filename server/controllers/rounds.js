import Round from "../models/Rounds.js";
import GolfCourse from "../models/GolfCourse.js";

const notFound = (res, message) => res.status(404).json({ message });
const badRequest = (res, message) => res.status(400).json({ message });
const internalServerError = (res, message) => res.status(500).json({ message });

export const getRounds = async (req, res) => {
  try {
    const rounds = await Round.find();
    res.json(rounds);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params roundId
// @returns a single round by id
export const getRoundById = async (req, res) => {
  const roundId = req.params.id;
  try {
    const round = await Round.findById(roundId).populate("golfCourse");

    if (!round) return notFound(res, "Round not found");
    res.json(round);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @body golfCourse, teePlayed, scoreDetails ...previousRoundsData
// @creates new round
export const createGolfRound = async (req, res) => {
  console.log("here is the payload:", req.body);
  const {
    golfCourse,
    teePlayed,
    holeDetails,
    scoreDetails: clientScoreDetails,
    ...previousRoundsData
  } = req.body;

  console.log("Searching for course with ID:", golfCourse);
  const course = await GolfCourse.findById(golfCourse);

  if (!course) {
    console.log("Course not found in DB");
    return notFound(res, "No course with this ID.");
  }

  const teeAvailable = course.holeDetails.some((hole) =>
    hole.tees.some((tee) => tee.color === teePlayed)
  );

  if (!teeAvailable) {
    console.log("Selected tee unavailable");
    return badRequest(res, "Selected tee unavailable");
  }

  let scoreDetails = clientScoreDetails;

  if (!scoreDetails) {
    scoreDetails = course.holeDetails.map((hole) => ({
      hole: hole._id,
      score: null,
      putts: null,
      GIR: false,
      FIR: false,
    }));
  } else if (!Array.isArray(scoreDetails)) {
    return badRequest(res, "scoreDetails, if provided, must be an array.");
  }

  const totalHoles = scoreDetails.length;
  const successfulGIR = scoreDetails.filter((hole) => hole.GIR).length;
  const successfulFIR = scoreDetails.filter((hole) => hole.FIR).length;
  const totalPutts = scoreDetails.reduce(
    (sum, hole) => sum + (hole.putts || 0),
    0
  );
  const totalScore = scoreDetails.reduce(
    (sum, hole) => sum + (hole.score || 0),
    0
  );

  const GIRPercentage =
    totalHoles > 0 ? Math.round((successfulGIR / totalHoles) * 10000) / 100 : 0;
  const FIRPercentage =
    totalHoles > 0 ? Math.round((successfulFIR / totalHoles) * 10000) / 100 : 0;

  console.log("creating new round...");
  const round = new Round({
    ...previousRoundsData,
    golfCourse: golfCourse,
    teePlayed: teePlayed,
    GIRPercentage: GIRPercentage,
    FIRPercentage: FIRPercentage,
    totalPutts: totalPutts,
    totalScore: totalScore,
    scoreDetails: scoreDetails,
  });

  try {
    const savedRound = await round.save();
    console.log("Saved round:", savedRound);

    await GolfCourse.findByIdAndUpdate(golfCourse, {
      $push: { rounds: savedRound._id },
    });

    res.status(201).json(savedRound);
  } catch (err) {
    console.log("Error while saving round:", err);
    badRequest(res, err.message);
  }
};

// @params roundId, holeId
// @updates single hole score from a round
export const updateHoleScoreFromRoundId = async (req, res) => {
  try {
    const { roundId, holeId } = req.params;

    const round = await Round.findById(roundId);
    if (!round)
      return notFound(res, `No round ID: ${roundId} found in database.`);

    const holeDetail = round.scoreDetails.id(holeId);
    if (!holeDetail) return notFound(res, "Hole details not found.");

    // .set() the holeDetail mongoose subdoc
    holeDetail.set({ ...holeDetail.toObject(), ...req.body }); //convert holeDetail to plain js and merge its obj with data from req.body

    res.json({
      message: "Hole score update success",
      data: {
        round: round,
        holeDetail: holeDetail,
      },
    });
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params roundId, holeId
// @returns single hole from a round
export const getSingleHoleByRoundId = async (req, res) => {
  try {
    const { roundId, holeId } = req.params;

    const round = await Round.findById(roundId);
    if (!round) return notFound(res, "Round not available.");

    const holeDetail = round.scoreDetails.id(holeId);
    if (!holeDetail) return notFound(res, "Hole not available.");

    res.json(holeDetail);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params roundId
// @body hole, score, putts, GIR, FIR
// @returns an added score to a round by its id
export const addScoreToRoundId = async (req, res) => {
  try {
    const { hole, score, putts, GIR, FIR } = req.body;
    const roundId = req.params.roundId;

    let round = await Round.findById(roundId);
    if (!round) {
      return notFound(res, "Round not found.");
    }

    const existingHole = round.scoreDetails.find(
      (detail) => detail.hole.toString() === hole
    );

    if (existingHole) {
      existingHole.score = score;
      existingHole.putts = putts;
      existingHole.GIR = GIR;
      existingHole.FIR = FIR;
    } else {
      round.scoreDetails.push({ hole, score, putts, GIR, FIR });
    }

    await round.save();

    const totalHoles = round.scoreDetails.length;
    const successfulGIR = round.scoreDetails.filter((hole) => hole.GIR).length;
    const successfulFIR = round.scoreDetails.filter((hole) => hole.FIR).length;

    const totalPutts = round.scoreDetails.reduce(
      (sum, hole) => sum + hole.putts,
      0
    );
    const totalScore = round.scoreDetails.reduce(
      (sum, hole) => sum + hole.score,
      0
    );

    const GIRPercentage =
      Math.round((successfulGIR / totalHoles) * 10000) / 100;
    const FIRPercentage =
      Math.round((successfulFIR / totalHoles) * 10000) / 100;

    round.set("GIRPercentage", GIRPercentage);
    round.set("FIRPercentage", FIRPercentage);
    round.set("totalPutts", totalPutts);
    round.set("totalScore", totalScore);

    await round.save();

    res.json(round);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

// @params roundId
//@body teePlayed
//@returns players selected tee color for round
export const selectedTeeColor = async (req, res) => {
  try {
    const { teePlayed } = req.body;
    const roundId = req.params.roundId;

    const updatedRound = await Round.findByIdAndUpdate(
      roundId,
      { teePlayed: teePlayed },
      { new: true, runValidators: true }
    );

    if (!updatedRound) return notFound(res, "Round not found.");
    res.json(updatedRound);
  } catch (err) {
    internalServerError(res, err.message);
  }
};

export const updateOverallRoundScores = async (req, res) => {
  try {
    const { roundId } = req.params;

    const round = await Round.findById(roundId);
    if (!round) return notFound(res, "No round with this ID");

    const totalHoles = round.scoreDetails.length;
    const successfulGIR = round.scoreDetails.filter((hole) => hole.GIR).length;
    const successfulFIR = round.scoreDetails.filter((hole) => hole.FIR).length;
    const totalPutts = round.scoreDetails.reduce(
      (sum, hole) => sum + hole.putts,
      0
    );
    const totalScore = round.scoreDetails.reduce(
      (sum, hole) => sum + hole.score,
      0
    );
    const GIRPercentage =
      Math.round((successfulGIR / totalHoles) * 10000) / 100;
    const FIRPercentage =
      Math.round((successfulFIR / totalHoles) * 10000) / 100;

    round.set("GIRPercentage", GIRPercentage);
    round.set("FIRPercentage", FIRPercentage);
    round.set("totalPutts", totalPutts);
    round.set("totalScore", totalScore);

    await round.save();

    res.json({
      message: "Round score updated: success",
      data: round,
    });
  } catch (err) {
    internalServerError(res, err.message);
  }
};
