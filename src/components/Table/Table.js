import React from 'react';
import './Table.css';
import Bloco from '../Bloco/Bloco';

const coresTransacoes = {
  T1: '#0066ff',
  T2: '#e63946',
  T3: '#8e44ad',
  T4: '#2a9d8f',
};

function interpretarOperacao(op) {
  const partes = op.split(':');

  if (partes.length === 2 && partes[1].includes('=')) return partes[1];

  if (partes.length === 3) {
    const [, tipo, item] = partes;
    switch (tipo) {
      case 'R': return `read_item(${item})`;
      case 'W': return `write_item(${item})`;
      case 'RL': return `read_lock(${item})`;
      case 'WL': return `write_lock(${item})`;
      case 'U': return `unlock(${item})`;
      default: return `${tipo}(${item})`;
    }
  }

  if (partes.length === 2 && partes[1] === 'Commit') return 'commit';
  return op;
}

function Table({ operacoes, passoAtual, errors }) {
  const transacoes = Array.from(new Set(operacoes.map(op => op.split(':')[0])));
  const linhas = [];
  const totalLinhas = Math.max(9, passoAtual + 1);

  for (let i = 0; i < totalLinhas; i++) {
    const op = operacoes[i] || '';
    const transacao = op.split(':')[0];
    const texto = i <= passoAtual ? interpretarOperacao(op) : '';
    const cor = coresTransacoes[transacao] || 'black';

    const linha = transacoes.map((t, index) => {
      if (t === transacao && texto) {
        const direcao = index < transacoes.length / 2 ? 'slide-from-left' : 'slide-from-right';

        return (
          <Bloco
            key={`${i}-${t}`}
            texto={texto}
            cor={cor}
            animacao={direcao}
            pulsando={errors?.[i] === true}
          />
        );
      }
      return <div key={`${i}-${t}`}></div>;
    });

    linhas.push(
      <div className="linha-container" key={i}>
        <div className="numero-linha">{i + 1}.</div>
        <div className="linha-operacao">{linha}</div>
      </div>
    );
  }

  return (
    <div className="janela-tabela">
      <div className="barra-superior">
        <span className="circulo vermelho" />
        <span className="circulo amarelo" />
        <span className="circulo verde" />
      </div>
      <div className="conteudo-tabela">
        <div className="execucao-tabela">
          <div className="header-linha">
            {transacoes.map(t => (
              <div key={t} style={{ flex: 1, color: coresTransacoes[t], textAlign: 'center' }}>{t}</div>
            ))}
          </div>
          {linhas}
        </div>
      </div>
    </div>

  );
}

export default Table;


