// Transação não pode realizar ações após commit ou abort
export default function noActionAfterEnd(instructions = []) {
  const transactions = {};
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [transactionId, actionWithData] = instruction.split(':');
    const action = (actionWithData?.split('(')[0] || '').toLowerCase();

    if (!transactions[transactionId]) {
      transactions[transactionId] = {
        ended: false
      };
    }

    const t = transactions[transactionId];

    if (t.ended) {
      errors.push({
        index,
        texto: `${transactionId} executou após término (linha ${index + 1})`
      });
    }

    if (['commit', 'abort'].includes(action)) {
      t.ended = true;
    }
  });

  return errors.map(e => ({
    name: e.texto,
    indices: [e.index]
  }));

}