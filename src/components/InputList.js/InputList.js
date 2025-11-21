import React, { useState, useEffect } from 'react';
import './InputList.css';

const letras = ['X:', 'Y:', 'Z:', 'W:', 'A:', 'B:', 'C:', 'D:'];

function InputList({ quantidade, onChange, valoresIniciais = [], disabled = false }) {

   const isDisabledByQuantidade = quantidade === 0;
  const campos = isDisabledByQuantidade ? 3 : quantidade;

  const [valores, setValores] = useState(() => Array(campos).fill(''));

  useEffect(() => {
    const novosValores = valoresIniciais.length === quantidade
      ? valoresIniciais
      : Array(quantidade).fill('');
    setValores(novosValores);
  }, [valoresIniciais, quantidade]);


  useEffect(() => {
    const preenchidos = valores.every(v => v.trim() !== '');
    if (preenchidos && !disabled) {
      onChange(valores);
    }
  }, [valores, onChange, disabled]);

  const handleChange = (index, novoValor) => {
    if (isDisabledByQuantidade || disabled) return;
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
            disabled={isDisabledByQuantidade || disabled}
            className={(isDisabledByQuantidade || disabled) ? 'disabled-input' : ''}
            onChange={(e) => handleChange(i, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default InputList;
