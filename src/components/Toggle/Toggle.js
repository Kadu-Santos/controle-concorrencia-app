import React from 'react';
import './Toggle.css';

function Toggle({ valor, onChange }) {
  return (
    <div className="variaveis-toggle">
      <div className="radio-group">
        <label>
          <input
            type="radio"
            value="sim"
            checked={valor === true}
            onChange={() => onChange(true)}
          />
          Sim
        </label>
        <label>
          <input
            type="radio"
            value="nao"
            checked={valor === false}
            onChange={() => onChange(false)}
          />
          Não
        </label>
      </div>
    </div>
  );
}

export default Toggle;
