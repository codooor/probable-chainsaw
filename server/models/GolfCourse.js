import mongoose from "mongoose";

const courseLengthByTeeColor = new mongoose.Schema({
  color: String,
  front: Number,
  back: Number,
  total: Number,
});

const teeSchema = new mongoose.Schema({
  color: String,
  par: Number,
  holeLength: Number,
  handicap: Number,
});

const holeSchema = new mongoose.Schema({
  holeNumber: Number,
  tees: [teeSchema],
});

const golfCourseSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },

  location: {
    city: String,
    county: String,
    state: String,
    country: String,
  },

  holeDetails: [holeSchema],

  courseLength: [courseLengthByTeeColor],

  layout: String,

  coursePar: Number,

  rounds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
    },
  ],
});

export const TeeSchema = teeSchema;
export default mongoose.model("GolfCourse", golfCourseSchema);
