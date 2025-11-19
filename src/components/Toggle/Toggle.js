import React from 'react';
import './Toggle.css';

function Toggle({ valor, onChange }) {
  return (
    <div className="variaveis-toggle">
      <div className="radio-group">

        <label>
          <input
            type="radio"
            checked={valor}
            onChange={() => onChange(true)}
          />
          Sim
        </label>

        <label>
          <input
            type="radio"
            checked={!valor}
            onChange={() => onChange(false)}
          />
          Não
        </label>

      </div>
    </div>
  );
}

export default Toggle;
