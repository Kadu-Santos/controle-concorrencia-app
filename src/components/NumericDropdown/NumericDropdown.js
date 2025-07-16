import React from 'react';
import './NumericDropdown.css';

function NumericDropdown({ opcoes, onChange, largura = '90px', altura = '40px' }) {
    const handleChange = (e) => {
        const valorSelecionado = parseInt(e.target.value);
        onChange(valorSelecionado);
    };

    return (
        <select
            className="dropdown"
            onChange={handleChange}
            defaultValue=""
            style={{ width: largura, height: altura}}
        >
            <option value="" disabled>N</option>
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
