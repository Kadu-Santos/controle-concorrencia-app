// scheduler.js
// Escalonador com bloqueio imediato e concessão retroativa.
// Entrada esperada: "T1:WL:X", "T2:RL:Y", "T3:U:X", "T1:Commit" etc.
// ctx:
//  {
//    locks: { [item]: { type: "RL"|"WL", holders: Set<string> } },
//    blockedTransactions: Set<string>,
//    waitingByTransaction: { [tid]: Array<{ item, type, index, message }> },
//    waitingQueueByItem: { [item]: Array<{ tid, type, index, message }> }
//  }
//
// Retornos:
//  { status: "executado" }
//  { status: "esperando", mensagem: "..." }
//  { status: "executado", granted: [{ tid, item, lockIndex, message }, ...] }

export default function scheduler(op, ctx = {}, index = null) {
  if (!op || typeof op !== 'string') return { status: 'executado' };

  const parts = op.split(':').map(p => p.trim());
  if (parts.length < 2) return { status: 'executado' };

  const tid = parts[0];
  let tipo = parts[1] ? parts[1].toUpperCase() : '';
  const item = parts[2] || null;

  // Inicializações defensivas
  if (!ctx.locks) ctx.locks = {};
  if (!ctx.blockedTransactions) ctx.blockedTransactions = new Set();
  if (!ctx.waitingByTransaction) ctx.waitingByTransaction = {};
  if (!ctx.waitingQueueByItem) ctx.waitingQueueByItem = {};

  const { locks, blockedTransactions, waitingByTransaction, waitingQueueByItem } = ctx;

  // helper: ensure waitingByTransaction[tid] is an array
  const ensureWaitingList = (t) => {
    if (!waitingByTransaction[t]) waitingByTransaction[t] = [];
    return waitingByTransaction[t];
  };

  // Se a transação já está bloqueada e faz nova operação, retorna que continua esperando
  if (blockedTransactions.has(tid)) {
    const waits = waitingByTransaction[tid] || [];
    const w = waits[waits.length - 1];
    return { status: 'esperando', mensagem: w?.message || `${tid} aguardando...` };
  }

  // --------- UNLOCK (U:item) ---------
  if (tipo === 'U' && item) {
    const current = locks[item];

    // remover tid dos holders se houver
    if (current && current.holders && current.holders.has(tid)) {
      current.holders.delete(tid);
      if (current.holders.size === 0) {
        delete locks[item];
      }
    }

    // tentar conceder pedidos na fila deste item (pode conceder múltiplos RLs)
    const queue = waitingQueueByItem[item] ? [...waitingQueueByItem[item]] : [];
    const granted = [];

    // while: conceder RLs consecutivos quando possível, e um WL quando possível (exclusivo)
    while (queue.length > 0) {
      const next = queue[0]; // espiar
      const { tid: nextTid, type: nextType, index: lockIndex, message } = next;
      const cur = locks[item];

      // Pedido RL
      if (nextType === 'RL') {
        // concede RL se não houver WL ativo
        if (!cur || cur.type === 'RL') {
          locks[item] = locks[item] || { holders: new Set(), type: 'RL' };
          locks[item].type = 'RL';
          locks[item].holders.add(nextTid);

          // remover da fila e do waitingByTransaction e blockedTransactions
          queue.shift();
          // remove a entrada correspondente em waitingByTransaction[nextTid] (por index)
          if (waitingByTransaction[nextTid]) {
            waitingByTransaction[nextTid] = waitingByTransaction[nextTid].filter(e => e.index !== lockIndex);
            if (waitingByTransaction[nextTid].length === 0) delete waitingByTransaction[nextTid];
          }
          blockedTransactions.delete(nextTid);

          granted.push({ tid: nextTid, item, lockIndex, message });
          // continuar para possivelmente conceder mais RLs
          continue;
        } else {
          // existe WL ativo -> não concede RL
          break;
        }
      }

      // Pedido WL
      if (nextType === 'WL') {
        // concede WL somente se não houver holders ou se o único holder for o próprio nextTid (upgrade)
        if (!cur || cur.holders.size === 0 || (cur.holders.size === 1 && cur.holders.has(nextTid))) {
          locks[item] = { holders: new Set([nextTid]), type: 'WL' };
          queue.shift();

          if (waitingByTransaction[nextTid]) {
            waitingByTransaction[nextTid] = waitingByTransaction[nextTid].filter(e => e.index !== lockIndex);
            if (waitingByTransaction[nextTid].length === 0) delete waitingByTransaction[nextTid];
          }
          blockedTransactions.delete(nextTid);

          granted.push({ tid: nextTid, item, lockIndex, message });
          // ao conceder WL (exclusivo), não conceder mais ninguém
          break;
        } else {
          // ainda há outros holders -> não concede WL
          break;
        }
      }

      // tipo inesperado -> remover defensivamente
      queue.shift();
      if (waitingByTransaction[nextTid]) {
        waitingByTransaction[nextTid] = waitingByTransaction[nextTid].filter(e => e.index !== lockIndex);
        if (waitingByTransaction[nextTid].length === 0) delete waitingByTransaction[nextTid];
      }
      blockedTransactions.delete(nextTid);
    }

    // atualizar fila no contexto
    if (queue.length === 0) {
      delete waitingQueueByItem[item];
    } else {
      waitingQueueByItem[item] = queue;
    }

    if (granted.length > 0) {
      return { status: 'executado', granted };
    }

    return { status: 'executado' };
  }

  // --------- COMMIT / ABORT ---------
  if (tipo === 'COMMIT' || tipo === 'ABORT') {
    // remover locks da transação
    Object.keys(locks).forEach(key => {
      const cur = locks[key];
      if (cur && cur.holders && cur.holders.has(tid)) {
        cur.holders.delete(tid);
        if (cur.holders.size === 0) delete locks[key];
      }
    });

    // remover pedidos pendentes do tid (se houver) das filas
    if (waitingByTransaction[tid]) delete waitingByTransaction[tid];
    Object.keys(waitingQueueByItem).forEach(k => {
      waitingQueueByItem[k] = waitingQueueByItem[k].filter(q => q.tid !== tid);
      if (waitingQueueByItem[k].length === 0) delete waitingQueueByItem[k];
    });

    blockedTransactions.delete(tid);

    // opcional: após liberar locks por commit, deixar concessões para futuros UNLOCKs
    return { status: 'executado' };
  }

  // --------- LOCK REQUEST (RL / WL) ---------
  if ((tipo === 'RL' || tipo === 'WL') && item) {
    const current = locks[item];

    // caso item livre => concede imediatamente
    if (!current) {
      locks[item] = { holders: new Set([tid]), type: tipo };
      return { status: 'executado' };
    }

    // caso compartilhado (RL) e pedido RL => concede compartilhado
    if (current.type === 'RL' && tipo === 'RL') {
      current.holders.add(tid);
      return { status: 'executado' };
    }

    // caso upgrade RL -> WL quando a própria transação é o único leitor => concede (upgrade)
    if (current.type === 'RL' && tipo === 'WL' && current.holders.size === 1 && current.holders.has(tid)) {
      current.type = 'WL';
      current.holders = new Set([tid]);
      return { status: 'executado' };
    }

    // caso já seja holder de WL => já tem o lock
    if (current.type === 'WL' && current.holders.has(tid)) {
      return { status: 'executado' };
    }

    // caso contrário -> precisa esperar: enfileira se ainda não estiver enfileirado
    waitingQueueByItem[item] = waitingQueueByItem[item] || [];

    // evitar duplicatas: mesma tid, mesmo tipo, mesmo index
    const alreadyQueued = waitingQueueByItem[item].some(q => q.tid === tid && q.type === tipo && q.index === index);
    if (!alreadyQueued) {
      const holdersList = (current && current.holders) ? [...current.holders].join(', ') : 'nenhum';
      const message = `${tid} aguardando liberação de ${item} por ${holdersList}`;
      const entry = { tid, type: tipo, index, message };

      waitingQueueByItem[item].push(entry);
      ensureWaitingList(tid).push({ item, type: tipo, index, message });
      blockedTransactions.add(tid);
    }

    const waitingMsg = (waitingByTransaction[tid] && waitingByTransaction[tid].length > 0)
      ? waitingByTransaction[tid][waitingByTransaction[tid].length - 1].message
      : `${tid} aguardando...`;

    return { status: 'esperando', mensagem: waitingMsg };
  }

  // --------- Operações normais (R, W, expressões sem lock) ---------
  return { status: 'executado' };
}
