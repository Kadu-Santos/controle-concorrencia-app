// 2PL: Não pode liberar um recurso que não foi previamente bloqueado
export default function noUnlockWithoutLock(instructions = []) {
  const txLocks = {};  // Map de transações com seus recursos bloqueados
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [tid, op, item] = instruction.split(':');

    if (!txLocks[tid]) {
      txLocks[tid] = new Set();
    }

    if (op === 'RL' || op === 'WL') {
      txLocks[tid].add(item);
    }

    if (op === 'U') {
      if (!txLocks[tid].has(item)) {
        errors.push({
          index,
          texto: `${tid} tentou liberar ${item} sem tê-lo bloqueado`
        });
      }
    }
  });

  return errors.length > 0
    ? {
        nome: errors.map(e => e.texto),
        indices: errors.map(e => e.index)
      }
    : null;
}
