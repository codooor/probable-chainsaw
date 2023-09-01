import "./App.css";

import StartRound from "./components/StartRound";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<StartRound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
