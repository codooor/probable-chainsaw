import mongoose from "mongoose";
import GolfCourse from "./GolfCourse.js";

const roundSchema = new mongoose.Schema({
  date: Date,

  teeTime: String,

  weather: {
    temp: Number,
    wind: String,
    conditions: String,
    season: String,
  },

  teePlayed: {
    type: String,
    required: true,
  },

  scoreDetails: [
    {
      hole: String,
      score: Number,
      putts: Number,
      GIR: Boolean,
      FIR: Boolean,
    },
  ],

  GIRPercentage: {
    type: Number,
    default: 0,
  },

  FIRPercentage: {
    type: Number,
    default: 0,
  },

  totalPutts: {
    type: Number,
    default: 0,
  },

  totalScore: {
    type: Number,
    default: 0,
  },

  notes: String,

  golfCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GolfCourse",
    required: true,
  },
});

export default mongoose.model("Round", roundSchema);
