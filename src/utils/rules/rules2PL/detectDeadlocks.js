// Detecta deadlock usando Wait-For Graph
// Formato esperado das instruções: "T1:RL:X", "T2:WL:X", "T1:U:X", "T1:Commit"
// Retorno: null (se não houver deadlock) ou lista de erros no padrão [{ name, indices }]
export default function detectDeadlock(instructions = []) {
  // Estrutura que guarda quem tem lock em cada item
  // Exemplo: locks["X"] = { holders: Set("T1", "T2"), type: "RL" }
  const locks = {};

  // Grafo de espera: waitFor["T1"] = Set("T2") significa que T1 está esperando T2
  const waitFor = {};

  // Lista de erros encontrados
  const errors = [];

  // Funções auxiliares -----------------------------

  // Garante que a transação existe no grafo
  const ensureWaitFor = (tid) => {
    if (!waitFor[tid]) waitFor[tid] = new Set();
  };

  // Limpa as dependências de espera de uma transação (quando ela consegue o lock)
  const clearWaitFor = (tid) => {
    if (waitFor[tid]) waitFor[tid].clear();
  };

  // Remove todas as arestas que apontam para uma transação (quando ela libera lock ou termina)
  const removeEdgesPointingTo = (freedTid) => {
    Object.keys(waitFor).forEach(t => {
      waitFor[t].delete(freedTid);
    });
  };

  // Detecta ciclos no grafo de espera (se tiver ciclo = deadlock)
  const findCycle = () => {
    const visited = new Set();
    const stack = new Set();
    const parent = {};

    function dfs(node) {
      if (!waitFor[node]) return null;
      visited.add(node);
      stack.add(node);

      for (const neighbor of waitFor[node]) {
        if (!visited.has(neighbor)) {
          parent[neighbor] = node;
          const res = dfs(neighbor);
          if (res) return res;
        } else if (stack.has(neighbor)) {
          // Achamos um ciclo → reconstruímos o caminho
          const cycle = [neighbor];
          let cur = node;
          while (cur !== neighbor && cur !== undefined) {
            cycle.push(cur);
            cur = parent[cur];
          }
          cycle.push(neighbor);
          return cycle.reverse();
        }
      }

      stack.delete(node);
      return null;
    }

    // Testa todos os nós do grafo
    for (const node of Object.keys(waitFor)) {
      if (!visited.has(node)) {
        const res = dfs(node);
        if (res) return res;
      }
    }
    return null;
  };

  // Processa cada instrução da execução -----------------------------
  instructions.forEach((instr, index) => {
    if (!instr || instr.includes('=')) return; // ignora atribuições tipo "T1:X = Y + 1"
    const parts = instr.split(':');
    if (parts.length < 2) return;

    const tid = (parts[0] || '').trim();   // id da transação
    const op = (parts[1] || '').trim().toUpperCase(); // operação (RL, WL, U, COMMIT...)
    const item = (parts[2] || null);       // recurso (ex: X, Y...)

    if (!tid || !op) return;
    ensureWaitFor(tid);

    // Pedido de lock (RL ou WL)
    if ((op === 'RL' || op === 'WL') && item) {
      const current = locks[item];

      if (!current) {
        // Item livre → concede lock
        locks[item] = { holders: new Set([tid]), type: op };
        clearWaitFor(tid);
      } else {
        // Item já tem lock
        if (current.type === 'RL') {
          if (op === 'RL') {
            // Vários leitores podem compartilhar
            current.holders.add(tid);
            clearWaitFor(tid);
          } else {
            // Pedido de WL enquanto já existem leitores
            const otherHolders = [...current.holders].filter(h => h !== tid);
            if (otherHolders.length === 0) {
              // Só o próprio tid tinha RL → pode fazer upgrade para WL
              current.type = 'WL';
              current.holders = new Set([tid]);
              clearWaitFor(tid);
            } else {
              // Bloqueado pelos outros leitores
              otherHolders.forEach(h => waitFor[tid].add(h));
              const cycle = findCycle();
              if (cycle) {
                errors.push({
                  index,
                  texto: `Deadlock detectado na linha ${index + 1}: ciclo entre transações ${cycle.join(' -> ')}`
                });
              }
            }
          }
        } else {
          // Já existe um WL
          const otherHolders = [...current.holders].filter(h => h !== tid);
          if (otherHolders.length === 0) {
            // O próprio tid já tem WL
            clearWaitFor(tid);
          } else {
            // Bloqueado pelo holder do WL
            otherHolders.forEach(h => waitFor[tid].add(h));
            const cycle = findCycle();
            if (cycle) {
              errors.push({
                index,
                texto: `Deadlock detectado na linha ${index + 1}: ciclo entre transações ${cycle.join(' -> ')}`
              });
            }
          }
        }
      }
      return;
    }

    // Unlock → libera recurso
    if (op === 'U' && item) {
      const current = locks[item];
      if (current && current.holders.has(tid)) {
        current.holders.delete(tid);
        if (current.holders.size === 0) delete locks[item];
        removeEdgesPointingTo(tid);
      }
      return;
    }

    // Commit ou Abort → libera todos os locks e remove do grafo
    if (op === 'COMMIT' || op === 'ABORT') {
      Object.keys(locks).forEach(key => {
        const cur = locks[key];
        if (cur.holders.has(tid)) {
          cur.holders.delete(tid);
          if (cur.holders.size === 0) delete locks[key];
        }
      });
      removeEdgesPointingTo(tid);
      delete waitFor[tid];
      return;
    }
  });

  // Se não houve deadlock → null
  if (errors.length === 0) return null;

  // Retorna lista de erros no padrão usado pelo verificador
  return errors.map(e => ({
    name: e.texto,
    indices: [e.index]
  }));
}