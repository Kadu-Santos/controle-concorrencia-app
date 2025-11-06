import React, { useMemo, useState } from 'react';
import './ResultTable.css';

function permutar(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((v, i) =>
    permutar(arr.filter((_, j) => j !== i)).map(p => [v, ...p])
  );
}

function aplicarOperacoes(operacoes, ordem, valoresIniciais, vars) {
  const estado = {};
  vars.forEach((v, i) => (estado[v] = valoresIniciais[i] ?? 0));

  ordem.forEach((tx) => {
    const pendenteAtual = {};

    operacoes.forEach((opRaw) => {
      const partes = opRaw.split(':');
      if (partes[0] !== tx) return;

      if (partes.length === 2 && partes[1].includes('=')) {
        const [v, expr] = partes[1].split('=');
        try {
          const rhs = expr.replace(/[A-Z]/g, (m) => estado[m] ?? 0);
          // eslint-disable-next-line no-new-func
          pendenteAtual[v] = Function(`"use strict"; return (${rhs})`)();
        } catch {
          pendenteAtual[v] = 'Erro';
        }
      }

      if (partes.length === 3 && partes[1] === 'W') {
        const v = partes[2];
        if (pendenteAtual[v] !== undefined) {
          estado[v] = pendenteAtual[v];
        }
      }
    });
  });

  return estado;
}

function aplicarSimultaneo(operacoes, valoresIniciais, vars) {
  const estado = {};
  vars.forEach((v, i) => (estado[v] = valoresIniciais[i] ?? 0));

  const pendente = {};

  operacoes.forEach((opRaw) => {
    const partes = opRaw.split(':');
    const tx = partes[0];

    if (!pendente[tx]) pendente[tx] = {};

    if (partes.length === 2 && partes[1].includes('=')) {
      const [v, expr] = partes[1].split('=');
      try {
        const rhs = expr.replace(/[A-Z]/g, (m) => estado[m] ?? 0);
        // eslint-disable-next-line no-new-func
        pendente[tx][v] = Function(`"use strict"; return (${rhs})`)();
      } catch {
        pendente[tx][v] = 'Erro';
      }
    }

    if (partes.length === 3 && partes[1] === 'W') {
      const v = partes[2];
      if (pendente[tx][v] !== undefined) {
        estado[v] = pendente[tx][v];
      }
    }
  });

  return { ordem: 'Simultânea', estadoFinal: estado, destaque: 'simultanea' };
}

function estadosIguais(a, b, vars) {
  return vars.every((v) => a[v] === b[v]);
}

export default function ResultTable({
  status = "desativado", // "ativo" | "executando" | "desativado"
  operacoes = [],
  valoresIniciais = [],
  quantidadeVariaveis = 4,
}) {
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const vars = ['X', 'Y', 'Z', 'W', 'V'].slice(0, quantidadeVariaveis);

  const transacoes = useMemo(() => {
    const todas = Array.from(new Set(operacoes.map((op) => op.split(':')[0])));
    return todas.filter((tx) =>
      operacoes.some(
        (op) =>
          op.startsWith(`${tx}:W:`) ||
          (op.startsWith(`${tx}:`) && op.includes('='))
      )
    );
  }, [operacoes]);

  const ordensSeq = useMemo(() => permutar(transacoes), [transacoes]);

  const resultados = useMemo(() => {
    const vistos = [];
    const sequenciais = [];

    for (const ordem of ordensSeq) {
      const estado = aplicarOperacoes(operacoes, ordem, valoresIniciais, vars);
      const jaExiste = vistos.some((prev) => estadosIguais(prev, estado, vars));
      if (!jaExiste) {
        vistos.push(estado);
        sequenciais.push({
          ordem: ordem.join('→'),
          estadoFinal: estado,
          destaque: 'sequencial',
        });
      }
    }

    return [aplicarSimultaneo(operacoes, valoresIniciais, vars), ...sequenciais];
  }, [ordensSeq, operacoes, valoresIniciais, vars]);

  const resultadosVisiveis = mostrarTodas
    ? resultados
    : [resultados[0], ...resultados.slice(1, 6)];

  const linhasAtivas = status === "ativo"
    ? [...resultadosVisiveis, ...Array(Math.max(0, 4 - resultadosVisiveis.length)).fill(null)]
    : Array(4).fill(null);

  return (
    <div className={`tabela-resultado ${status === "desativado" ? "desativada" : ""} ${status === "executando" ? "executando" : ""}`}>
      <table>
        <colgroup>
          <col className="col-ordem" />
          {vars.map((_, i) => <col key={i} className="col-var" />)}
        </colgroup>

        <thead>
          <tr>
            <th>Ordem</th>
            {vars.map((v) => (
              <th key={v}>{v}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {status === "ativo" ? (
            linhasAtivas.map((res, idx) =>
              res ? (
                <tr key={idx} className={`linha-${res.destaque} fade-in`}>
                  <td>{res.ordem}</td>
                  {vars.map((v) => {
                    const val = res.estadoFinal[v];
                    const isErro = val === 'Erro';
                    return (
                      <td
                        key={v}
                        className={isErro ? 'celula-erro' : ''}
                        title={isErro ? 'Expressão inválida ou variável indefinida' : ''}
                      >
                        {isErro ? '⚠️ Erro' : val ?? '-'}
                      </td>
                    );
                  })}
                </tr>
              ) : (
                <tr key={idx} className="linha-placeholder fade-in">
                  <td>-</td>
                  {vars.map((v) => (
                    <td key={v}>-</td>
                  ))}
                </tr>
              )
            )
          ) : status === "executando" ? (
            <tr className="linha-placeholder fade-in">
              <td colSpan={vars.length + 1}>
                <span className="aguardando-text">
                  Executando<span className="dots"></span>
                </span>
              </td>
            </tr>
          ) : (
            <tr className="linha-placeholder fade-in">
              <td colSpan={vars.length + 1}>
                Execução sem variáveis
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {status === "ativo" && !mostrarTodas && resultados.length > 7 && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button onClick={() => setMostrarTodas(true)}>Ver todas as ordens</button>
        </div>
      )}
    </div>
  );
}
