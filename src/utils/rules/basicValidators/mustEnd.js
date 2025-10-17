// Transações devem finalizar com commit ou abort
export default function mustEnd(instructions = []) {
  const transactions = {}; // Guarda infos por transação
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [transactionId, actionWithData] = instruction.split(':');
    const action = (actionWithData?.split('(')[0] || '').toLowerCase();

    if (!transactions[transactionId]) {
      transactions[transactionId] = {
        ended: false,
        lastIndex: index
      };
    }

    // Atualiza o último índice encontrado dessa transação
    transactions[transactionId].lastIndex = index;

    if (['commit', 'abort'].includes(action)) {
      transactions[transactionId].ended = true;
    }
  });

  Object.entries(transactions).forEach(([tid, t]) => {
    if (!t.ended) {
      errors.push({
        index: t.lastIndex,
        texto: `${tid} não foi finalizada com commit ou abort`
      });
    }
  });

  return errors.map(e => ({
    name: e.texto,
    indices: [e.index]
  }));
}
