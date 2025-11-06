// ExecutionEngine.js
// Engine that controls execution logic and emits events for UI.
// Depends on a scheduler function (synchronous) that manipulates ctx.
// Events: start, execute, wait, grant, finish, pause, stop, error
export class ExecutionEngine {
  constructor(instructions = [], schedulerFn, opts = {}) {
    this.instructions = Array.isArray(instructions) ? instructions : [];
    this.scheduler = schedulerFn;
    this.stepDelay = opts.stepDelay ?? 1200;
    this.ctx = opts.ctx ?? {
      locks: {},
      blockedTransactions: new Set(),
      waitingByTransaction: {},
      waitingQueueByItem: {},
    };

    this.callbacks = {};
    this._processed = new Set();
    this._waiting = new Set();
    this._running = false;
    this._index = 0;
  }

  // permite ajustar dinamicamente a velocidade (ms)
  setStepDelay(ms) {
    const n = Number(ms) || 0;
    this.stepDelay = Math.max(50, Math.floor(n));
  }

  on(event, fn) {
    this.callbacks[event] = fn;
  }

  emit(event, payload) {
    const cb = this.callbacks[event];
    try {
      if (cb) cb(payload);
    } catch (err) {
      console.error('ExecutionEngine callback error', event, err);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  start() {
    if (this._running) return;
    this._running = true;
    this.emit('start');
    this._runLoop();
  }

  pause() {
    this._running = false;
    this.emit('pause');
  }

  stop() {
    this._running = false;
    this._processed.clear();
    this._waiting.clear();
    this._index = 0;
    this.emit('stop');
  }

  // smallDelay: fraction of stepDelay used for intermediate visual spacing
  _smallDelay() {
    return Math.max(50, Math.floor(this.stepDelay * 0.25));
  }

  async _runLoop() {
    while (this._running && this._index < this.instructions.length) {
      const i = this._index;

      if (this._processed.has(i)) {
        this._index++;
        continue;
      }

      const instr = this.instructions[i];
      const result = this.scheduler(instr, this.ctx, i);

      if (result.status === 'esperando') {
        this._waiting.add(i);
        this.emit('wait', { index: i, instrucao: instr, mensagem: result.mensagem });
        // Apenas um sleep dominante por step para esperar antes do próximo passo
        await this.sleep(this.stepDelay);
        this._index++;
        continue;
      }

      if (result.status === 'executado') {
        this._processed.add(i);
        this.emit('execute', { index: i, instrucao: instr });

        if (result.granted) {
          // grants podem ser múltiplos; emitir logs e reprocessar de forma cadenciada
          const grants = Array.isArray(result.granted) ? result.granted : [result.granted];

          for (const g of grants) {
            // emitir o grant imediatamente para feedback no terminal/UI
            this.emit('grant', g);

            // reprocessar waits vinculados a este grant; cada reprocessamento
            // usará stepDelay antes de emitir 'execute' (garante sincronização).
            const indicesToTry = this._resolveGrantToIndices(g);

            // processar cada índice resolvido sequencialmente com pequeno espaçamento
            for (const idx of indicesToTry) {
              this._waiting.delete(idx);
              if (!this._processed.has(idx)) {
                await this._processWaitingChain(idx);
              }
            }

            // espaçamento curto entre grants para manter animações distintas
            await this.sleep(Math.max(50, Math.floor(this.stepDelay * 0.12)));
          }
        }

        // um único sleep dominante após processar a instrução atual
        await this.sleep(this.stepDelay);
        this._index++;
        continue;
      }

      // safety fallback
      this._index++;
    }

    this._running = false;
    this.emit('finish', { success: true });
  }

  _resolveGrantToIndices(grant) {
    const indices = new Set();

    // 1) explicit lockIndex in grant
    if (grant && typeof grant.lockIndex === 'number') {
      indices.add(grant.lockIndex);
    }

    // 2) lookup by transaction in scheduler's map (collect, but don't return early)
    try {
      if (grant && grant.tid && this.ctx && this.ctx.waitingByTransaction) {
        const entry = this.ctx.waitingByTransaction[grant.tid];
        if (entry && typeof entry.index === 'number') {
          indices.add(entry.index);
        } else if (Array.isArray(entry)) {
          entry.forEach(e => {
            if (typeof e.index === 'number') indices.add(e.index);
          });
        }
      }
    } catch (e) {
      // ignore lookup errors and continue to defensive scan
    }

    // 3) defensive scan: find waiting indices that relate to the same item or tid
    if (grant && (grant.item || grant.tid)) {
      for (const idx of Array.from(this._waiting)) {
        if (this._processed.has(idx)) continue;
        const instr = this.instructions[idx];
        if (!instr || typeof instr !== 'string') continue;
        const parts = instr.split(':').map(p => p.trim());
        const tid = parts[0];
        const item = parts[2] || parts[1];
        if (grant.tid && tid === grant.tid) {
          indices.add(idx);
        } else if (grant.item && item === grant.item) {
          indices.add(idx);
        }
      }
    }

    return Array.from(indices);
  }

  async _processWaitingChain(lockIndex) {
    if (this._processed.has(lockIndex)) {
      return;
    }

    if (lockIndex < 0 || lockIndex >= this.instructions.length) {
      return;
    }

    const instr = this.instructions[lockIndex];
    const result = this.scheduler(instr, this.ctx, lockIndex);

    if (result.status === 'esperando') {
      this._waiting.add(lockIndex);
      this.emit('wait', { index: lockIndex, instrucao: instr, mensagem: result.mensagem });
      return;
    }

    // Ao reprocessar um índice que saiu de espera, aguardamos o stepDelay completo
    // para que a execução recomece no ritmo definido pelo usuário.
    await this.sleep(this.stepDelay);

    this._processed.add(lockIndex);
    this.emit('execute', { index: lockIndex, instrucao: instr });

    if (result.granted) {
      const grants = Array.isArray(result.granted) ? result.granted : [result.granted];
      for (const g of grants) {
        this.emit('grant', g);

        // pequeno delay antes de reprocessar os índices associados ao grant

        await this.sleep(this._smallDelay());

        const indicesToTry = this._resolveGrantToIndices(g);

        for (const idx of indicesToTry) {
          this._waiting.delete(idx);
          if (!this._processed.has(idx)) {
            await this._processWaitingChain(idx);
          }
        }

        if (typeof g.lockIndex === 'number') {
          this._waiting.delete(g.lockIndex);
        }

        await this.sleep(Math.max(50, Math.floor(this.stepDelay * 0.12)));
      }
    }

    // After executing this instruction, try to advance subsequent operations belonging to same tid
    const [tid] = (typeof instr === 'string' ? instr.split(':') : []);
    if (!tid) return;
    let j = lockIndex + 1;
    while (j < this.instructions.length) {
      const op = this.instructions[j];
      const parts = typeof op === 'string' ? op.split(':') : [];
      const tidJ = parts[0]?.trim();
      if (tidJ !== tid) break;

      if (this._processed.has(j)) {
        j++;
        continue;
      }

      const res = this.scheduler(op, this.ctx, j);
      if (res.status === 'esperando') {
        this._waiting.add(j);
        this.emit('wait', { index: j, instrucao: op, mensagem: res.mensagem });
        break;
      }

      // quando avançamos a sequência do mesmo tid, usamos apenas um pequeno delay
      
      await this.sleep(this.stepDelay);

      this._processed.add(j);
      this.emit('execute', { index: j, instrucao: op });

      if (res.granted) {
        const sub = Array.isArray(res.granted) ? res.granted : [res.granted];
        for (const sg of sub) {
          this.emit('grant', sg);

          
          await this.sleep(this._smallDelay());
      


          const subIndices = this._resolveGrantToIndices(sg);
          for (const si of subIndices) {
            this._waiting.delete(si);
            if (!this._processed.has(si)) {
              await this._processWaitingChain(si);
            }
          }

          if (typeof sg.lockIndex === 'number') {
            this._waiting.delete(sg.lockIndex);
          }

          await this.sleep(Math.max(50, Math.floor(this.stepDelay * 0.12)));
        }
      }

      j++;
    }
  }
}
