// 2PL: Não pode liberar um recurso que não foi previamente bloqueado
export default function noUnlockWithoutLock(instructions = []) {
  const txLocks = {};  // Map de transações com seus recursos bloqueados
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [tid, op, item] = instruction.split(':');
    const opNorm = op?.toUpperCase();

    if (!txLocks[tid]) {
      txLocks[tid] = new Set();
    }

    if (opNorm === 'RL' || opNorm === 'WL') {
      txLocks[tid].add(item);
    }

    if (opNorm === 'U') {
      if (!txLocks[tid].has(item)) {
        errors.push({
          index,
          texto: `${tid} tentou liberar ${item} sem tê-lo bloqueado`
        });
      } else {
        txLocks[tid].delete(item);
      }
    }
  });

  return errors.map(e => ({
    name: e.texto,
    indices: [e.index]
  }));

}
