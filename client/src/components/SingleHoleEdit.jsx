export default function SingleHoleEdit({ holeScore, roundId, onUpdate }) {
  const handleUpdate = (score) => {
    const parsedScore = parseInt(score, 10);
    if (!isNaN(parsedScore)) {
      onUpdate(holeScore.score, parsedScore, roundId);
    } else {
      alert("Please enter a valid score");
    }
  };

  return (
    <div className="hole-edit">
      <h3>Edit Hole {holeScore.hole}</h3>
      <p>Yardage: {tees?.length || "-"}</p>
      <p>Par: {tees?.par || "-"}</p>
      <p>Handicap: {tees?.handicap || "-"}</p>
      <div className="score-input">
        <label>
          Score:
          <input type="number" min="1" step="1" />
        </label>
      </div>
      <button onClick={handleUpdate}>Update Score</button>
    </div>
  );
}
