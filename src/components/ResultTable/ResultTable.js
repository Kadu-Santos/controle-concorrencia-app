import React, { useMemo } from 'react';
import './ResultTable.css';

function permutar(arr) {
    if (arr.length <= 1) return [arr];
    return arr.flatMap((v, i) =>
        permutar(arr.filter((_, j) => j !== i)).map(p => [v, ...p])
    );
}

function aplicarOperacoes(operacoes, ordem, valoresIniciais, vars) {
    const estado = {};
    vars.forEach((v, i) => estado[v] = valoresIniciais[i] ?? null);

    ordem.forEach(tx => {
        const pendenteAtual = {};

        operacoes.forEach(opRaw => {
            const partes = opRaw.split(':');
            if (partes[0] !== tx) return;

            // Cálculo direto: T1:X=X*2
            if (partes.length === 2 && partes[1].includes('=')) {
                const [v, expr] = partes[1].split('=');
                try {
                    const rhs = expr.replace(/[A-Z]/g, m => estado[m] ?? 0);
                    // eslint-disable-next-line no-new-func
                    pendenteAtual[v] = Function(`"use strict"; return (${rhs})`)();
                } catch {
                    pendenteAtual[v] = 'Erro';
                }

            }

            // Escrita: T1:W:X
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
    vars.forEach((v, i) => estado[v] = valoresIniciais[i] ?? null);

    const pendente = {};

    operacoes.forEach(opRaw => {
        const partes = opRaw.split(':');
        const tx = partes[0];

        if (!pendente[tx]) pendente[tx] = {};

        if (partes.length === 2 && partes[1].includes('=')) {
            const [v, expr] = partes[1].split('=');
            try {
                const rhs = expr.replace(/[A-Z]/g, m => estado[m] ?? 0);
                // eslint-disable-next-line no-new-func
                pendente[tx][v] = Function(`"use strict"; return (${rhs})`)();
            } catch {
                pendente[tx][v] = 'Erro';
            }

        }

        // Caso: operação W:X
        if (partes.length === 3 && partes[1] === 'W') {
            const v = partes[2];
            if (pendente[tx][v] !== undefined) {
                estado[v] = pendente[tx][v];
            }
        }
    });

    return { ordem: 'Simultânea', estadoFinal: estado, destaque: 'simultanea' };
}


export default function ResultTable({ ativa, operacoes = [], valoresIniciais = [], quantidadeVariaveis = 3 }) {

    const vars = ['X', 'Y', 'Z', 'W', 'V'].slice(0, quantidadeVariaveis);

    const transacoes = useMemo(() => {
        return Array.from(new Set(operacoes.map(op => op.split(':')[0])));
    }, [operacoes]);

    const ordensSeq = useMemo(() => permutar(transacoes), [transacoes]);

    const resultados = useMemo(() => {
        const sequenciais = ordensSeq.map(ordem => ({
            ordem: ordem.join('→'),
            estadoFinal: aplicarOperacoes(operacoes, ordem, valoresIniciais, vars),
            destaque: 'sequencial'
        }));

        return [
            aplicarSimultaneo(operacoes, valoresIniciais, vars),
            ...sequenciais
        ];
    }, [ordensSeq, operacoes, valoresIniciais, vars]);

    return (
        <div className={`tabela-resultado ${ativa ? '' : 'desativada'}`}>
            <table>
                <thead>
                    <tr>
                        <th>Ordem</th>
                        {vars.map(v => <th key={v}>{v}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {resultados.map(({ ordem, estadoFinal, destaque }, idx) => (
                        <tr key={idx} className={`linha-${destaque}`}>
                            <td>{ordem}</td>
                            {vars.map(v => <td key={v}>{estadoFinal[v] ?? '-'}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
