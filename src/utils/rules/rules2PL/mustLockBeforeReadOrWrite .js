// 2PL: Transação deve adquirir lock antes de ler ou escrever
export default function mustLockBeforeReadOrWrite(instructions = []) {
  const txLocks = {}; // Guarda os locks ativos por transação
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [tid, op, item] = instruction.split(':');
    const opNorm = op?.toUpperCase();

    if (!txLocks[tid]) txLocks[tid] = new Set();

    // Se for RL ou WL, registra o lock no conjunto
    if (opNorm === 'RL' || opNorm === 'WL') {
      txLocks[tid].add(item);
    }

    // Se for R ou W, verifica se tinha lock antes
    if ((opNorm === 'R' || opNorm === 'W') && !txLocks[tid].has(item)) {
      errors.push({
        index,
        texto: `${tid} realizou ${opNorm}:${item} sem adquirir lock previamente`
      });
    }

    // Se for U, remove o lock
    if (opNorm === 'U') {
      txLocks[tid].delete(item);
    }
  });

  return errors.map(e => ({
    name: e.texto,
    indices: [e.index]
  }));

}
