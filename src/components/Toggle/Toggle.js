import React from 'react';
import './Toggle.css';

function Toggle({ valor, onChange, disabled = false }) {
  return (
    <div className={`variaveis-toggle ${disabled ? 'disabled' : ''}`}>
      <div className="radio-group">

        <label>
          <input
            type="radio"
            checked={valor}
            onChange={() => !disabled && onChange(true)}
          />
          Sim
        </label>

        <label>
          <input
            type="radio"
            checked={!valor}
            onChange={() => !disabled && onChange(false)}
          />
          Não
        </label>

      </div>
    </div>
  );
}

export default Toggle;
