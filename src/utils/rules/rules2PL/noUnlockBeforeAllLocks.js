// 2PL: Não pode liberar (U) antes de adquirir todos os locks
export default function noUnlockBeforeAllLocks(instructions = []) {
  const txData = {};
  const errors = [];

  instructions.forEach((instruction, index) => {
    const [tid, op, item] = instruction.split(':');

    if (!txData[tid]) {
      txData[tid] = {
        sawUnlock: false,
        indicesAfterUnlock: [] // armazena possíveis erros
      };
    }

    const t = txData[tid];

    if (op === 'U') {
      t.sawUnlock = true;
    }

    if ((op === 'RL' || op === 'WL') && t.sawUnlock) {
      errors.push({
        index,
        texto: `${tid} solicitou ${op}:${item} após iniciar liberação`
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
