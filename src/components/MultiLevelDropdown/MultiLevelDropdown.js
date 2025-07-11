import React, { useState, useEffect, useRef } from 'react';
import './MultiLevelDropdown.css';

const acoes = ['R', 'W', 'RL', 'WL', 'U', 'Operacão', 'Commit'];

function MultiLevelDropdown({ numTransacoes, numVariaveis, onSelecionar, valorSelecionado }) {
    const [hoveredTransacao, setHoveredTransacao] = useState(null);
    const [hoveredAcao, setHoveredAcao] = useState(null);
    const [menuAberto, setMenuAberto] = useState(false);
    const dropdownRef = useRef(null);

    const transacoes = Array.from({ length: numTransacoes }, (_, i) => `T${i + 1}`);
    const variaveis = ['X', 'Y', 'Z'].slice(0, numVariaveis);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuAberto(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClick = (transacao, acao, variavel = null) => {
        let resultado;

        if (acao === 'Operacão' && variavel) {
            resultado = `${transacao}:${variavel}`;
        } else if (variavel) {
            resultado = `${transacao}:${acao}:${variavel}`;
        } else {
            resultado = `${transacao}:${acao}`;
        }

        onSelecionar(resultado);
        setMenuAberto(false);
    };


    return (
        <div className="multi-dropdown" ref={dropdownRef}>
            <button className="dropdown-button" onClick={() => setMenuAberto(!menuAberto)}>
                {valorSelecionado || "Selecione"}
            </button>

            {menuAberto && (
                <div className="dropdown-menu">
                    {transacoes.map((t) => (
                        <div
                            className="dropdown-item relative"
                            key={t}
                            onMouseEnter={() => setHoveredTransacao(t)}
                        >
                            {t}
                            {hoveredTransacao === t && (
                                <div className="submenu absolute">
                                    {acoes.map((a) => (
                                        <div
                                            className="dropdown-item relative"
                                            key={a}
                                            onMouseEnter={() => setHoveredAcao(a)}
                                            onClick={a === 'Commit' ? () => handleClick(t, a) : undefined}
                                        >
                                            {a}
                                            {a !== 'Commit' && hoveredAcao === a && (
                                                <div className="submenu absolute">
                                                    {variaveis.map((v) => (
                                                        <div
                                                            className="dropdown-item"
                                                            key={v}
                                                            onClick={() => handleClick(t, a, v)}
                                                        >
                                                            {v}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
      
    </div>
    );
}

export default MultiLevelDropdown;
