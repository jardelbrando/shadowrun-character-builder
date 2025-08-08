import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import StepsManager from "./steps/stepsManager"; // ajuste o caminho conforme sua pasta
import { objectInfos } from "./stores/objectInfos";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className='title-home'>{objectInfos.labels.title}</h1>
      <div className="blue-neon-border">
        <p>{objectInfos.labels.homeText}</p>
      </div>
      <button className="button-generic" onClick={() => navigate("/builder")}>{objectInfos.labels.startButton}</button>
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