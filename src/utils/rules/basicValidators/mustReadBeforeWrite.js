// Transação deve ler o dado antes de escrever
export default function mustReadBeforeWrite(instructions = []) {
  const transactions = {};
  const errors = [];

  instructions.forEach((instruction, index) => {
    const partes = instruction.split(':').map(p => p.trim());
    
    if (partes.length !== 3) return;

    const [transactionId, action, data] = partes;

    if (!transactions[transactionId]) {
      transactions[transactionId] = { readData: new Set() };
    }

    const tx = transactions[transactionId];
    const actionNorm = action.toUpperCase();

    // Escrever sem ter lido antes
    if (actionNorm === 'W' && !tx.readData.has(data)) {
      errors.push({
        index,
        texto: `Transação ${transactionId} tentou escrever em ${data} sem leitura prévia (linha ${index + 1})`
      });
    }

    // Registrar leitura
    if (actionNorm === 'R') {
      tx.readData.add(data);
    }
  });

  return errors.map(e => ({
    name: e.texto,
    indices: [e.index]
  }));
}
