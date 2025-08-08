import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import StepsManager from "./steps/stepsManager"; // ajuste o caminho conforme sua pasta

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className='title-home'>Shadowrun Character Builder</h1>
      <div className="blue-neon-border">
        <p>This application aims to assist players of the tabletop RPG Shadowrun 5th edition in creating their characters on a non-profit basis.</p>
      </div>
      <button className="button-generic" onClick={() => navigate("/builder")}>
        Begin
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />              {/* Home */}
        <Route path="/builder" element={<StepsManager />} /> {/* StepsManager */}
      </Routes>
    </BrowserRouter>
  );
}