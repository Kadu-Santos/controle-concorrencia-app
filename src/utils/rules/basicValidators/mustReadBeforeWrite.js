// Transação deve ler o dado antes de escrever
export default function mustReadBeforeWrite(instructions = []) {
  const transactions = {}; // Armazena os dados lidos por cada transação
  const errors = [];

  instructions.forEach((instruction, index) => {
    const partes = instruction.split(':');
    if (partes.length !== 3) return;

    const [transactionId, action, data] = partes;

    if (!transactions[transactionId]) {
      transactions[transactionId] = {
        readData: new Set(),
      };
    }

    const tx = transactions[transactionId];

    if (action === 'W' && !tx.readData.has(data)) {
      errors.push({
        index,
        texto: `${transactionId} escreveu ${data} sem ler antes na linha ${index + 1}`
      });
    }

    if (action === 'R') {
      tx.readData.add(data);
    }
  });

  return errors.length > 0
    ? {
        nome: errors.map(e => e.texto),
        indices: errors.map(e => e.index),
      }
    : null;
}
