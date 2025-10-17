// 2PL: Após liberar um lock, a transação não pode adquirir novos
export default function noLockAfterUnlock(instructions = []) {
  const released = {}; // Marca se a transação já entrou na fase de liberação
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [tid, op] = instruction.split(':');
    const opNorm = op?.toUpperCase();

    if (!released[tid]) released[tid] = false;

    if (opNorm === 'U') {
      released[tid] = true;
    }

    if ((opNorm === 'RL' || opNorm === 'WL') && released[tid]) {
      errors.push({
        index,
        texto: `${tid} solicitou ${opNorm} após ter iniciado liberação de bloqueios`
      });
    }
  });

  return errors.map(e => ({
    name: e.texto,
    indices: [e.index]
  }));

}
