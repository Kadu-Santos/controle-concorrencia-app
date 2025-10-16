import React from 'react';
import './NumericDropdown.css';

function NumericDropdown({ opcoes, onChange, value = "", largura = '120px' }) {
  const handleChange = (e) => {
    const valorSelecionado = parseInt(e.target.value);
    onChange(valorSelecionado);
  };

  return (
    <select
      className="dropdown"
      onChange={handleChange}
      value={value === 0 ? "" : value}   // ← agora o select mostra o valor correto
      style={{ width: largura }}
    >
      <option value="" disabled>
        N
      </option>
      {opcoes.map((opcao, index) => {
        const valorNumerico = parseInt(opcao);
        return (
          <option key={index} value={valorNumerico}>
            {opcao}
          </option>
        );
      })}
    </select>
  );
}

export default NumericDropdown;
