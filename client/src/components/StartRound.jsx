import { useState, useEffect } from "react";
import axios from "axios";

import Scorecard from "./Scorecard";

export default function StartRound() {
  const [courses, setCourses] = useState([]); //
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTees, setSelectedTees] = useState(null);
  const [roundStarted, setRoundStarted] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getCourses() {
      try {
        setLoading(true);
        const allCoursesInDb = await axios.get(
          "http://localhost:7777/golf-courses"
        );
        console.log("Course arrays:", allCoursesInDb.data.data);
        setCourses(allCoursesInDb.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error during creation of this round:", err.message);
        setError("Failed to load courses.");
        setLoading(false);
      }
    }

    getCourses();
  }, []);

  const startRoundButton = async () => {
    try {
      const startedRoundCreation = await axios.post(
        "http://localhost:7777/rounds",
        {
          golfCourse: selectedCourse._id,
          teePlayed: selectedTees,
        }
      );

      console.log("Created round response:", startedRoundCreation);

      const newRoundId = startedRoundCreation.data._id; // declare newRoundId
      console.log("New Round ID:", newRoundId);

      // adding to localStorage for unknown reasons at the moment. Maybe future offline activities
      localStorage.setItem("selectedCourse", JSON.stringify(selectedCourse));
      localStorage.setItem("selectedTees", selectedTees);

      setRoundStarted(true);
      setSelectedRoundId(newRoundId); // Set round ID state
    } catch (err) {
      console.error("Error starting new round", err.response.data);
      alert("Failed to start new round. Please try again.");
    }
  };

  function resetRound() {
    setRoundStarted(false);
    setSelectedCourse(null);
    setSelectedTees(null);

    // again same convention as above. Maybe future use with offline features
    localStorage.removeItem("selectedCourse");
    localStorage.removeItem("selectedTees");
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (roundStarted && selectedRoundId) {
    return (
      <Scorecard
        onGoBack={resetRound}
        courseId={selectedCourse._id}
        selectedTees={selectedTees}
        newRoundId={selectedRoundId}
      />
    );
  }

  return (
    <div className="start-round">
      <h2>Select Course and Tees</h2>

      <div className="dropdown">
        {/* find first courseId that matches the target value */}
        <select
          value={selectedCourse?._id || ""}
          onChange={(e) =>
            setSelectedCourse(
              courses.find((course) => course._id === e.target.value)
            )
          }
        >
          <option value="" disabled>
            Select Course
          </option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* first checks course selection for truthy value */}
      {selectedCourse && (
        <div className="dropdown">
          <select
            value={selectedTees || ""}
            onChange={(e) => setSelectedTees(e.target.value)}
          >
            <option value="" disabled>
              Select Tees
            </option>
            {selectedCourse.holeDetails[0]?.tees.map((tee) => (
              <option key={tee._id} value={tee.color}>
                {tee.color}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedCourse && selectedTees && (
        <button onClick={startRoundButton}>Start Round</button>
      )}
    </div>
  );
}
