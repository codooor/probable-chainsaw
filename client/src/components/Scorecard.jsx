import { useState, useEffect } from "react";
import axios from "axios";

export default function Scorecard({
  onGoBack,
  courseId,
  selectedTees,
  newRoundId,
}) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeeColor, setSelectedTeeColor] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [roundId, setRoundId] = useState(null);
  const [scores, setScores] = useState({}); // This will store hole scores.

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    axios
      .get(`http://localhost:7777/golf-courses/${courseId}`)
      .then((res) => {
        setCourseData(res.data);
        setSelectedCourse(res.data.data);
        setSelectedTeeColor(selectedTees);
        setRoundId(newRoundId);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [courseId, newRoundId, selectedTees]);

  const handleScoreChange = (holeNumber, e) => {
    setScores({
      ...scores,
      [holeNumber]: e.target.value,
    });
  };

  if (loading) return <div> ...Finding Zen </div>;

  if (error) return <div> Error: {error.message} </div>;

  return (
    <div className="scorecard">
      <h2>
        {selectedCourse?.name
          ? `${selectedCourse.name} - `
          : "Loading Course..."}
        {selectedTeeColor ? `${selectedTeeColor} Tees` : "Loading Tees..."}
      </h2>
      <table>
        <thead>
          <tr>
            <th>Hole</th>
            <th>Yardage</th>
            <th>Par</th>
            <th>HDCP</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {selectedCourse?.holeDetails.map((hole) => {
            const tee = hole.tees.find((t) => t.color === selectedTeeColor);
            return (
              <tr key={hole._id}>
                <td>{hole.holeNumber}</td>
                <td>{tee?.length || "-"}</td>
                <td>{tee?.par || "-"}</td>
                <td>{tee?.handicap || "-"}</td>
                <td>
                  <input
                    type="number"
                    value={scores[hole.holeNumber] || ""}
                    onChange={(e) => handleScoreChange(hole.holeNumber, e)}
                    placeholder="Enter score"
                  />
                </td>
              </tr>
            );
          })}
          <tr>
            <td>Total</td>
            <td>
              {selectedCourse &&
                selectedCourse.holeDetails.reduce((acc, courseHole) => {
                  const tee = courseHole.tees.find(
                    (courseTees) => courseTees.color === selectedTeeColor
                  );
                  return acc + (tee?.length || 0);
                }, 0)}
            </td>
            <td>
              {selectedCourse &&
                selectedCourse.holeDetails.reduce((acc, courseHole) => {
                  const tee = courseHole.tees.find(
                    (courseTees) => courseTees.color === selectedTeeColor
                  );
                  return acc + (tee?.par || 0);
                }, 0)}
            </td>
            <td>-</td>
            <td>
              {Object.values(scores).reduce(
                (acc, score) => acc + Number(score),
                0
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <button onClick={onGoBack}>Change Course</button>
    </div>
  );
}
