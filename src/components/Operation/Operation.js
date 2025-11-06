import React, { useState, useEffect, useRef } from 'react';
import './Operation.css';

function Operation({ numVariaveis, onOperacaoChange, valorInicial }) {
  const baseVariaveis = ['X', 'Y', 'Z', 'W', 'V'];
  const variaveis = baseVariaveis.slice(0, numVariaveis);
  const opcoes = [...variaveis, 'Digite...'];

  const [esquerda, setEsquerda] = useState('');
  const [direita, setDireita] = useState('');
  const [operador, setOperador] = useState('+');
  const [esquerdaManual, setEsquerdaManual] = useState(false);
  const [direitaManual, setDireitaManual] = useState(false);

  const ultimaExpressaoValidaRef = useRef(null);

  useEffect(() => {
    if (valorInicial && valorInicial !== ultimaExpressaoValidaRef.current) {
      const match = valorInicial.match(/^(.+?)([+\-*/])(.+)$/);
      if (match) {
        const left = match[1].trim();
        const op = match[2].trim();
        const right = match[3].trim();

        setOperador(op);

        // Esquerda
        if (variaveis.includes(left)) {
          setEsquerda(left);
          setEsquerdaManual(false);
        } else {
          setEsquerda(left);
          setEsquerdaManual(true);
        }

        // Direita
        if (variaveis.includes(right)) {
          setDireita(right);
          setDireitaManual(false);
        } else {
          setDireita(right);
          setDireitaManual(true);
        }
      }
    }
  }, [valorInicial, variaveis]);


  useEffect(() => {
    const camposPreenchidos = esquerda.trim() !== '' && direita.trim() !== '';
    const novaExpressao = `${esquerda}${operador}${direita}`;

    if (camposPreenchidos && novaExpressao !== ultimaExpressaoValidaRef.current) {
      ultimaExpressaoValidaRef.current = novaExpressao;
      onOperacaoChange(novaExpressao); // envia expressão válida
    } else if (!camposPreenchidos && ultimaExpressaoValidaRef.current !== null) {
      ultimaExpressaoValidaRef.current = null;
      onOperacaoChange(null); // remove expressão inválida
    }
  }, [esquerda, direita, operador, onOperacaoChange]);

  const handleSelect = (value, lado) => {
    if (value === 'Digite...') {
      if (lado === 'esquerda') {
        setEsquerda('');
        setEsquerdaManual(true);
      } else {
        setDireita('');
        setDireitaManual(true);
      }
    } else {
      if (lado === 'esquerda') {
        setEsquerda(value);
        setEsquerdaManual(false);
      } else {
        setDireita(value);
        setDireitaManual(false);
      }
    }
  };

  return (
    <div className="operacao-montagem">
      <p>=</p>
      {esquerdaManual ? (
        <input
          type="text"
          value={esquerda}
          onChange={(e) => setEsquerda(e.target.value)}
          className="campo-input"
          placeholder="Digite"
        />
      ) : (
        <select
          value={esquerda}
          onChange={(e) => handleSelect(e.target.value, 'esquerda')}
          className="campo-select"
        >
          <option value="" disabled>Selecione</option>
          {opcoes.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      )}

      <select
        value={operador}
        onChange={(e) => setOperador(e.target.value)}
        className="operador-select"
      >
        <option value="+">+</option>
        <option value="-">−</option>
        <option value="*">×</option>
        <option value="/">÷</option>
      </select>

      {direitaManual ? (
        <input
          type="text"
          value={direita}
          onChange={(e) => setDireita(e.target.value)}
          className="campo-input"
          placeholder="Digite"
        />
      ) : (
        <select
          value={direita}
          onChange={(e) => handleSelect(e.target.value, 'direita')}
          className="campo-select"
        >
          <option value="" disabled>Selecione</option>
          {opcoes.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      )}
    </div>
  );
}

export default Operation;
