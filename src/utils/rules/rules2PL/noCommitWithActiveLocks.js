// 2PL: Transação não pode finalizar (Commit) mantendo locks ativos
export default function noCommitWithActiveLocks(instructions = []) {
  const txLocks = {}; // Guarda os locks ativos por transação
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [tid, op, item] = instruction.split(':');
    const opNorm = op.toUpperCase();

    if (!txLocks[tid]) txLocks[tid] = new Set();

    // Quando adquirir lock (RL ou WL)
    if (opNorm === 'RL' || opNorm === 'WL') {
      txLocks[tid].add(item);
    }

    // Quando liberar lock
    if (opNorm === 'U') {
      txLocks[tid].delete(item);
    }

    // Se der commit, verifica se ainda tem locks ativos
    if (opNorm === 'Commit' && txLocks[tid].size > 0) {
      errors.push({
        index,
        texto: `${tid} tentou Commit mantendo locks ativos (${[...txLocks[tid]].join(', ')})`
      });
    }
  });

  return errors.map(e => ({
    name: e.texto,
    indices: [e.index]
  }));

}
