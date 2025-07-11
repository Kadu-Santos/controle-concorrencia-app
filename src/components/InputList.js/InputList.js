import React, { useState, useEffect } from 'react';
import './InputList.css';

const letras = ['X:', 'Y:', 'Z:', 'W:', 'A:', 'B:', 'C:', 'D:'];

function InputList({ quantidade, onChange }) {
  const isDisabled = quantidade === 0;
  const campos = isDisabled ? 3 : quantidade;

  const [valores, setValores] = useState(() => Array(campos).fill(''));

  useEffect(() => {
    setValores(Array(campos).fill(''));
  }, [campos]);
  
  useEffect(() => {
    const preenchidos = valores.every(v => v.trim() !== '');
    if (preenchidos) {
      onChange(valores);
    }
  }, [valores, onChange]);

  const handleChange = (index, novoValor) => {
    if (isDisabled) return;
    setValores(prev => {
      const novos = [...prev];
      novos[index] = novoValor;
      return novos;
    });
  };

  return (
    <div className="input-list">
      {Array.from({ length: campos }).map((_, i) => (
        <div className="input-item" key={i}>
          <label>{letras[i] || `V${i + 1}`}</label>
          <input
            type="text"
            value={valores[i] || ''}
            disabled={isDisabled}
            className={isDisabled ? 'disabled-input' : ''}
            onChange={(e) => handleChange(i, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default InputList;
