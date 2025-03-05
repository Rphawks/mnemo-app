import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home.tsx";
import styles from "./app.module.scss";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

function Main() {
  const navigate = useNavigate();

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.title}>
          welcome to <span className={styles.brand}>mnemo</span>,<br></br>
          your memory<br></br>assistant
        </div>
        <span className={styles.pronounce}>(neh-mo)</span>
        <button
          className={styles.startButton}
          onClick={() => navigate("/home")}
        >
          start
        </button>
      </div>
      <div className={styles.logo} />
    </div>
  );
}

export default App;
