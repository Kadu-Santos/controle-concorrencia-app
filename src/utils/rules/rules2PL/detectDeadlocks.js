// Detecta deadlock usando Wait-For Graph
// Formato esperado das instruções: "T1:RL:X", "T2:WL:X", "T1:U:X", "T1:Commit"
// Retorno: null (se não houver deadlock) ou lista de erros no padrão [{ name, indices }]
export default function detectDeadlock(instructions = []) {
  const locks = {};

  // Grafo de espera: agora guarda também o índice em que a dependência foi criada
  // Exemplo: waitFor["T1"].get("T2") = 2 significa que T1 espera T2 desde a linha 2
  const waitFor = {};

  const errors = [];

  const seenCycles = new Set();

  // Funções auxiliares -----------------------------

  const ensureWaitFor = (tid) => {
    if (!waitFor[tid]) waitFor[tid] = new Map();
  };

  const clearWaitFor = (tid) => {
    waitFor[tid]?.clear();
  };

  const removeEdgesPointingTo = (freedTid) => {
    Object.keys(waitFor).forEach(t => {
      waitFor[t]?.delete(freedTid);
    });
  };

  // Adiciona dependência com índice
  const addWaitEdge = (fromTid, toTid, index) => {
    ensureWaitFor(fromTid);
    if (!waitFor[fromTid].has(toTid)) {
      waitFor[fromTid].set(toTid, index);
    }
  };

  // Detecta ciclos no grafo de espera e retorna também o menor índice das arestas do ciclo
  const findCycle = () => {
    const visited = new Set();
    const stack = new Set();
    const parent = {};

    function dfs(node) {
      if (!waitFor[node]) return null;
      visited.add(node);
      stack.add(node);

      for (const neighbor of waitFor[node].keys()) {
        if (!visited.has(neighbor)) {
          parent[neighbor] = node;
          const res = dfs(neighbor);
          if (res) return res;
        } else if (stack.has(neighbor)) {
          const cycle = [neighbor];
          let cur = node;
          while (cur !== neighbor && cur !== undefined) {
            cycle.push(cur);
            cur = parent[cur];
          }
          cycle.push(neighbor);
          cycle.reverse();

          // menor índice entre as arestas do ciclo
          let minEdgeIndex = Infinity;
          for (let i = 0; i < cycle.length - 1; i++) {
            const from = cycle[i];
            const to = cycle[i + 1];
            const edgeIndex = waitFor[from]?.get(to);
            if (edgeIndex !== undefined && edgeIndex < minEdgeIndex) {
              minEdgeIndex = edgeIndex;
            }
          }

          return { cycleNodes: cycle, minEdgeIndex };
        }
      }

      stack.delete(node);
      return null;
    }

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
    if (!instr || instr.includes('=')) return;
    const parts = instr.split(':');
    if (parts.length < 2) return;

    const tid = (parts[0] || '').trim();
    const op = (parts[1] || '').trim().toUpperCase();
    const item = (parts[2] || null);

    if (!tid || !op) return;
    ensureWaitFor(tid);

    if ((op === 'RL' || op === 'WL') && item) {
      const current = locks[item];

      if (!current) {
        locks[item] = { holders: new Set([tid]), type: op };
        clearWaitFor(tid);
      } else {
        if (current.type === 'RL') {
          if (op === 'RL') {
            current.holders.add(tid);
            clearWaitFor(tid);
          } else {
            const otherHolders = [...current.holders].filter(h => h !== tid);
            if (otherHolders.length === 0) {
              current.type = 'WL';
              current.holders = new Set([tid]);
              clearWaitFor(tid);
            } else {
              otherHolders.forEach(h => addWaitEdge(tid, h, index));
              const res = findCycle();
              if (res) {
                const { cycleNodes, minEdgeIndex } = res;
                const cycleKey = cycleNodes.join("->");
                if (!seenCycles.has(cycleKey)) {
                  seenCycles.add(cycleKey);
                  errors.push({
                    index: minEdgeIndex,
                    texto: `Deadlock detectado (ciclo: ${cycleNodes.join(' -> ')}) iniciado na linha ${minEdgeIndex + 1}`
                  });
                }
              }
            }
          }
        } else {
          const otherHolders = [...current.holders].filter(h => h !== tid);
          if (otherHolders.length === 0) {
            clearWaitFor(tid);
          } else {
            otherHolders.forEach(h => addWaitEdge(tid, h, index));
            const res = findCycle();
            if (res) {
              const { cycleNodes, minEdgeIndex } = res;
              const cycleKey = cycleNodes.join("->");
              if (!seenCycles.has(cycleKey)) {
                seenCycles.add(cycleKey);
                errors.push({
                  index: minEdgeIndex,
                  texto: `Deadlock iniciado na linha ${minEdgeIndex + 1}. Ciclo: ${cycleNodes.join(' -> ')} `
                });
              }
            }
          }
        }
      }
      return;
    }

    if (op === 'U' && item) {
      const current = locks[item];
      if (current && current.holders.has(tid)) {
        current.holders.delete(tid);
        if (current.holders.size === 0) delete locks[item];
        removeEdgesPointingTo(tid);
      }
      return;
    }

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

  if (errors.length === 0) return null;

  return errors.map(e => ({
    name: e.texto,
    indices: [e.index]
  }));
}
