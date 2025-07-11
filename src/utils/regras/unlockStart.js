export default function invalidStart(operacoes) {
  const primeirasOperacoes = {};
  const indicesInvalidos = [];

  operacoes.forEach((op, index) => {
    const partes = op.split(':');
    if (partes.length < 2) return;

    const transacao = partes[0];
    const tipo = partes[1];

    if (!primeirasOperacoes.hasOwnProperty(transacao)) {
      primeirasOperacoes[transacao] = index;

      if (tipo === 'U') {
        indicesInvalidos.push(index);
      }
    }
  });

  if (indicesInvalidos.length > 0) {
    return {
      nome: 'Transação não pode iniciar com unlock!',
      indices: indicesInvalidos,
    };
  }

  return null;
}
