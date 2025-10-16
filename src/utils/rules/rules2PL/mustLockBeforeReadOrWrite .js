// 2PL: Transação deve adquirir lock antes de ler ou escrever
export default function mustLockBeforeReadOrWrite(instructions = []) {
  const txLocks = {}; // Guarda os locks ativos por transação
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [tid, op, item] = instruction.split(':');

    if (!txLocks[tid]) txLocks[tid] = new Set();

    // Se for RL ou WL, registra o lock no conjunto
    if (op === 'RL' || op === 'WL') {
      txLocks[tid].add(item);
    }

    // Se for R ou W, verifica se tinha lock antes
    if ((op === 'R' || op === 'W') && !txLocks[tid].has(item)) {
      errors.push({
        index,
        texto: `${tid} realizou ${op}:${item} sem adquirir lock previamente`
      });
    }

    // Se for U, remove o lock
    if (op === 'U') {
      txLocks[tid].delete(item);
    }
  });

  return errors.length > 0
    ? {
        nome: errors.map(e => e.texto),
        indices: errors.map(e => e.index)
      }
    : null;
}
