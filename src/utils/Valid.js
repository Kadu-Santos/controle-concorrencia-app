export function isOperacaoMatematica(op, numVariaveis) {
    const partes = op.split(":");
    const variaveis = ['X', 'Y', 'Z', 'W', 'V'].slice(0, numVariaveis);
    return (
        partes.length === 2 && /^[Tt]\d+$/.test(partes[0]) && variaveis.includes(partes[1])
    );
}

export function format(operacoes, expressoes, numVariaveis) {
  return operacoes
    .map((opStr, i) => {
      if (isOperacaoMatematica(opStr, numVariaveis) && expressoes[i]) {
        const [transacao, destino] = opStr.split(":");
        return `${transacao}:${destino}=${expressoes[i]}`;
      }
      return opStr;
    })
    .map(instr => instr.trim())
    .filter(Boolean);          
}