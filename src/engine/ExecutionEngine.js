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

    // Event system: map event -> Set of handlers
    this.callbacks = {};

    // internal state
    this._processed = new Set(); // indices already executed
    this._waiting = new Set();   // indices currently waiting
    this._running = false;       // loop running?
    this._index = 0;             // current scan index
    this._interrupted = false;   // stop() called
    this._onceWrappers = new WeakMap(); // support for off() on once handlers
  }

  // permite ajustar dinamicamente a velocidade (ms)
  setStepDelay(ms) {
    const n = Number(ms) || 0;
    this.stepDelay = Math.max(50, Math.floor(n));
  }

  // =====================
  // EVENT API
  // =====================
  on(event, handler) {
    if (!this.callbacks[event]) this.callbacks[event] = new Set();
    this.callbacks[event].add(handler);
    // retorna função para unsubscribe
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const s = this.callbacks[event];
    if (!s) return;
    // se foi registrado via once, pode existir wrapper
    const wrapper = this._onceWrappers.get(handler);
    if (wrapper && s.has(wrapper)) {
      s.delete(wrapper);
      this._onceWrappers.delete(handler);
      return;
    }
    s.delete(handler);
  }

  once(event, handler) {
    const wrapper = (payload) => {
      try {
        handler(payload);
      } finally {
        this.off(event, handler);
      }
    };
    // keep mapping to allow off(originalHandler)
    this._onceWrappers.set(handler, wrapper);
    this.on(event, wrapper);
    return () => this.off(event, handler);
  }

  emit(event, payload) {
    const set = this.callbacks[event];
    if (!set || set.size === 0) return;
    // iterate snapshot to allow handlers to remove themselves safely
    for (const handler of Array.from(set)) {
      try {
        handler(payload);
      } catch (err) {
        // Emissão de erro em handler não deve quebrar engine
        console.error("ExecutionEngine callback error", event, err);
        // também notificar via evento 'error'
        try {
          const errHandlerSet = this.callbacks['error'];
          if (errHandlerSet && errHandlerSet.size) {
            for (const h of Array.from(errHandlerSet)) {
              try { h(err); } catch (_) { /* swallow */ }
            }
          }
        } catch (_) { /* swallow */ }
      }
    }
  }

  removeAllListeners() {
    for (const k in this.callbacks) {
      const set = this.callbacks[k];
      if (set && typeof set.clear === 'function') set.clear();
    }
    this._onceWrappers = new WeakMap();
  }

  // =====================
  // UTIL
  // =====================
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  _smallDelay() {
    return Math.max(50, Math.floor(this.stepDelay * 0.25));
  }

  // =====================
  // CONTROL: start / pause / stop
  // =====================
  start() {
    if (this._running) return;
    this._running = true;
    this._interrupted = false;
    this.emit('start');
    // start loop (no await)
    void this._runLoop();
  }

  pause() {
    if (!this._running) return;
    this._running = false;
    this.emit('pause');
  }

  // stop marca interrupção e sinaliza para o loop terminar mais limpo
  stop() {
    if (!this._running && !this._interrupted) {
      // if not running, still mark interrupted to inform finish logic
      this._interrupted = true;
      this.emit('stop');
      return;
    }
    this._interrupted = true;
    this._running = false;
    this.emit('stop');
  }

  // full reset (limpa todo o estado interno)
  reset() {
    this._running = false;
    this._interrupted = false;
    this._processed.clear();
    this._waiting.clear();
    this._index = 0;
    // NÃO limpa listeners automaticamente: preserve API
  }

  // =====================
  // CORE: run loop & helpers
  // =====================
  async _runLoop() {
    try {
      // Loop principal: varre instruções sequencialmente
      while (this._running && this._index < this.instructions.length) {
        const i = this._index;

        // skip if already processed
        if (this._processed.has(i)) {
          this._index++;
          continue;
        }

        const instr = this.instructions[i];
        // SCHEDULER é síncrono e retorna { status, mensagem?, granted? }
        let result;
        try {
          result = this.scheduler(instr, this.ctx, i) || {};
        } catch (schedErr) {
          // scheduler deixou acontecer um erro — report e continue
          this.emit('error', { index: i, instrucao: instr, error: schedErr });
          // marcar como processado para evitar loop infinito
          this._processed.add(i);
          this.emit('execute', { index: i, instrucao: instr });
          this._index++;
          // pequena pausa
          await this.sleep(this._smallDelay());
          continue;
        }

        if (result.status === 'esperando') {
          this._waiting.add(i);
          this.emit('wait', { index: i, instrucao: instr, mensagem: result.mensagem });
          // sleep dominante para step
          await this.sleep(this.stepDelay);
          this._index++;
          continue;
        }

        if (result.status === 'executado') {
          // marcar como processado e emitir execute
          this._processed.add(i);
          this.emit('execute', { index: i, instrucao: instr });

          // Se o scheduler concedeu locks/grants, emitir e reprocessar waits
          if (result.granted) {
            const grants = Array.isArray(result.granted) ? result.granted : [result.granted];

            for (const g of grants) {
              // emitir grant imediatamente
              this.emit('grant', g);

              // reprocessar indices afetados por esse grant (resolve e chama _processWaitingChain)
              const indicesToTry = this._resolveGrantToIndices(g);

              for (const idx of indicesToTry) {
                this._waiting.delete(idx);
                if (!this._processed.has(idx)) {
                  await this._processWaitingChain(idx);
                }
              }

              // pequeno espaçamento entre grants para animação
              await this.sleep(Math.max(50, Math.floor(this.stepDelay * 0.12)));
            }
          }

          // sleep dominante após execução da instrução atual
          await this.sleep(this.stepDelay);
          this._index++;
          continue;
        }

        // safety fallback: se scheduler não retornou status conhecido
        this.emit('error', { index: i, instrucao: instr, message: 'scheduler returned unknown status' });
        this._index++;
      }

      // Quando o loop termina, definimos sucesso com base no estado atual
      const allProcessed = this._processed.size === this.instructions.length;
      const hasWaiting = this._waiting.size > 0;
      const wasInterrupted = !!this._interrupted;

      // se foi interrompido explicitamente, tratar como failure
      const success = allProcessed && !hasWaiting && !wasInterrupted;

      // garantir que engine está marcado como não-running
      this._running = false;

      // emitir finish com sucesso verdadeiro ou falso
      this.emit('finish', { success });

    } catch (err) {
      // Erro inesperado no loop: notificar e emitir finish(false)
      console.error("ExecutionEngine _runLoop error:", err);
      this._running = false;
      this.emit('error', err);
      try { this.emit('finish', { success: false }); } catch (_) { /* swallow */ }
    }
  }

  // resolve indices que devem ser reprocessados a partir de um grant
  _resolveGrantToIndices(grant) {
    const indices = new Set();

    if (!grant) return [];

    // 1) explicit lockIndex in grant
    if (typeof grant.lockIndex === 'number') indices.add(grant.lockIndex);

    // 2) lookup by transaction in ctx.waitingByTransaction
    try {
      if (grant.tid && this.ctx && this.ctx.waitingByTransaction) {
        const entry = this.ctx.waitingByTransaction[grant.tid];
        if (entry && typeof entry.index === 'number') indices.add(entry.index);
        else if (Array.isArray(entry)) {
          entry.forEach(e => { if (typeof e.index === 'number') indices.add(e.index); });
        }
      }
    } catch (e) {
      // ignore lookup errors
    }

    // 3) defensive scan across _waiting
    if (grant.item || grant.tid) {
      for (const idx of Array.from(this._waiting)) {
        if (this._processed.has(idx)) continue;
        const instr = this.instructions[idx];
        if (!instr || typeof instr !== 'string') continue;
        const parts = instr.split(':').map(p => p.trim());
        const tid = parts[0];
        const item = parts[2] || parts[1];
        if (grant.tid && tid === grant.tid) indices.add(idx);
        else if (grant.item && item === grant.item) indices.add(idx);
      }
    }

    return Array.from(indices);
  }

  // processa um índice que estava em espera (reavalia via scheduler e emite eventos)
  async _processWaitingChain(lockIndex) {
    if (this._processed.has(lockIndex)) return;
    if (lockIndex < 0 || lockIndex >= this.instructions.length) return;

    const instr = this.instructions[lockIndex];
    let result;
    try {
      result = this.scheduler(instr, this.ctx, lockIndex) || {};
    } catch (schedErr) {
      this.emit('error', { index: lockIndex, instrucao: instr, error: schedErr });
      // marcat como processed para evitar loops
      this._processed.add(lockIndex);
      this.emit('execute', { index: lockIndex, instrucao: instr });
      return;
    }

    if (result.status === 'esperando') {
      this._waiting.add(lockIndex);
      this.emit('wait', { index: lockIndex, instrucao: instr, mensagem: result.mensagem });
      return;
    }

    // espera completa do stepDelay para manter ritmo
    await this.sleep(this.stepDelay);

    this._processed.add(lockIndex);
    this.emit('execute', { index: lockIndex, instrucao: instr });

    if (result.granted) {
      const grants = Array.isArray(result.granted) ? result.granted : [result.granted];
      for (const g of grants) {
        this.emit('grant', g);
        // pequeno delay antes de reprocessar
        await this.sleep(this._smallDelay());

        const indicesToTry = this._resolveGrantToIndices(g);
        for (const idx of indicesToTry) {
          this._waiting.delete(idx);
          if (!this._processed.has(idx)) {
            await this._processWaitingChain(idx);
          }
        }

        if (typeof g.lockIndex === 'number') this._waiting.delete(g.lockIndex);

        await this.sleep(Math.max(50, Math.floor(this.stepDelay * 0.12)));
      }
    }

    // tentativa de avançar operações subsequentes do mesmo tid
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

      const res = this.scheduler(op, this.ctx, j) || {};
      if (res.status === 'esperando') {
        this._waiting.add(j);
        this.emit('wait', { index: j, instrucao: op, mensagem: res.mensagem });
        break;
      }

      // quando avançamos a sequência do mesmo tid, usamos o stepDelay
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

          if (typeof sg.lockIndex === 'number') this._waiting.delete(sg.lockIndex);
          await this.sleep(Math.max(50, Math.floor(this.stepDelay * 0.12)));
        }
      }

      j++;
    }
  }
}
