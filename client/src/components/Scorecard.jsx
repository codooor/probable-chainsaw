import { useState, useEffect } from "react";
import axios from "axios";

import SingleHoleEdit from "./SingleHoleEdit";

export default function Scorecard({ onGoBack, courseId, selectedTees }) {
  const [selectedCourse, setSelectedCourse] = useState(null); // state slice for selected course
  const [selectedTeeColor, setSelectedTeeColor] = useState(null); // state slice for selected tee color from course
  const [courseData, setCourseData] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    console.log("Starting console log:", courseId);
    axios
      .get(`http://localhost:7777/golf-courses/${courseId}`)
      .then((res) => {
        console.log("Payload from:", res.data);
        setCourseData(res.data);
        setSelectedCourse(res.data.data);
        setSelectedTeeColor(selectedTees);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error Fetching Data: ", err.message);
        setError(err.message);

        setLoading(false);
      });
  }, [courseId]);

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
              </tr>
            );
          })}
          <tr>
            <td>Total</td>
            <td>
              {/* calculating total length of all holes by checking againsts the selected tee color */}
              {selectedCourse &&
                selectedCourse.holeDetails.reduce((acc, courseHole) => {
                  const tee = courseHole.tees.find(
                    (courseTees) => courseTees.color === selectedTeeColor
                  );
                  return acc + (tee?.length || 0);
                }, 0)}
            </td>
            <td>
              {/* calculating total par of all holes by checking againsts the selected tee color */}
              {selectedCourse &&
                selectedCourse.holeDetails.reduce((acc, courseHole) => {
                  const tee = courseHole.tees.find(
                    (courseTees) => courseTees.color === selectedTeeColor
                  );
                  return acc + (tee?.par || 0);
                }, 0)}
            </td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
      <button onClick={onGoBack}>Change Course</button>
      {Array.isArray(courseData?.scoreDetails) &&
        courseData?.scoreDetails.map((holeScore, index) => (
          <SingleHoleEdit
            key={index}
            holeScore={holeScore}
            courseId={courseId}
          />
        ))}
    </div>
  );
}
