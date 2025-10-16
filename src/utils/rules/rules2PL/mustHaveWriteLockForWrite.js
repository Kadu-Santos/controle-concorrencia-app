// Escrita requer Write Lock (WL) previamente obtido pela MESMA transação.
// Formato aceito: "T1:W:X", "T1:WL:X", "T1:RL:X", "T1:U:X", "T1:Commit"
// Ignora expressões tipo "T1:X = Y + 1".
export default function mustHaveWriteLockForWrite(instructions = []) {
  const locks = {}; // { T1: { WL: Set(), RL: Set() } }
  const errors = [];

  instructions.forEach((instr, index) => {
    // Ignorar atribuições
    if (instr.includes('=')) return;

    const parts = instr.split(':');
    if (parts.length < 2) return;

    const tid = parts[0].trim();
    const action = parts[1].trim().toUpperCase();
    const variable = parts[2]?.trim();

    if (!locks[tid]) locks[tid] = { WL: new Set(), RL: new Set() };

    // Registrar locks
    if (action === 'WL' && variable) {
      locks[tid].WL.add(variable);
      return;
    }
    if (action === 'RL' && variable) {
      locks[tid].RL.add(variable);
      return;
    }

    // Unlock libera os locks da variável
    if (action === 'U' && variable) {
      locks[tid].WL.delete(variable);
      locks[tid].RL.delete(variable);
      return;
    }

    // Validação: W:X requer WL:X
    if (action === 'W' && variable && !locks[tid].WL.has(variable)) {
      errors.push({
        index,
        text: `A transação ${tid} escreveu ${variable} sem obter Write Lock (WL:${variable})`
      });
    }
  });

  if (errors.length === 0) return null;

  return {
    nome: errors.map(e => e.text).join('; '),
    indices: errors.map(e => e.index)
  };
}
