// A transação não pode iniciar com commit ou abort
export default function noCommitOrAbortFirst(instructions = []) {
  const firstOps = {};
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [transactionId, actionWithData] = instruction.split(':');
    const action = actionWithData.split('(')[0].toLowerCase();

    // Se for a primeira operação da transação
    if (!firstOps.hasOwnProperty(transactionId)) {
      firstOps[transactionId] = index;

      if (action === 'commit' || action === 'abort') {
        errors.push({
          index,
          message: `A transação ${transactionId} iniciou com ${action} na linha ${index + 1}`
        });
      }
    }
  });

  if (errors.length === 0) return null;

  return {
    nome: errors.map(e => e.message),
    indices: errors.map(e => e.index),
  };
}
