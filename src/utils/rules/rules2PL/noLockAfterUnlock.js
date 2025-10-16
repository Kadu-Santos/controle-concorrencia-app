// 2PL: Após liberar um lock, a transação não pode adquirir novos
export default function noLockAfterUnlock(instructions = []) {
  const released = {}; // Marca se a transação já entrou na fase de liberação
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [tid, op] = instruction.split(':');

    if (!released[tid]) released[tid] = false;

    if (op === 'U') {
      released[tid] = true;
    }

    if ((op === 'RL' || op === 'WL') && released[tid]) {
      errors.push({
        index,
        texto: `${tid} solicitou ${op} após ter iniciado liberação de bloqueios`
      });
    }
  });

  return errors.length > 0
    ? {
        nome: errors.map(e => e.texto),
        indices: errors.map(e => e.index)
      }
    : null;
}
