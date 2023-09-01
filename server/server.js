import express from "express";
import { config } from "dotenv";
import golfCourseRoutes from "./routes/golf-courses/index.js";
import roundScoreRoutes from "./routes/rounds/index.js";
import cors from "cors";
import connectDb from "./config/db.js";

const app = express();

config();
connectDb();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

app.use("/golf-courses", golfCourseRoutes);
app.use("/rounds", roundScoreRoutes);

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log(`Server Listening on http://localhost:${PORT}`);
});
