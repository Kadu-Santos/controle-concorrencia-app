import React from "react";
import "./WaitMessage.css";

function WaitMessage({ texto }) {
  if (!texto) return null;

  return (
    <div className="wait-message">
      <p className="message">⏳ {texto}</p>
    </div>
  );
}

export default WaitMessage;
