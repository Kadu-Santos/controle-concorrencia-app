import React from 'react';
import './HintButton.css';

function HintButton({ texto }) {
  return (
    <div className="hint-container">
      <button className="hint-button">?</button>
      <span className="hint-tooltip">{texto}</span>
    </div>
  );
}

export default HintButton;
