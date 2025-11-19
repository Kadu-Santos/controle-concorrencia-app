import { useState, useRef, useEffect } from "react";
import { ExecutionEngine } from "../engine/ExecutionEngine";
import scheduler from "../engine/Scheduler";
import verifier from "../utils/Verifier";

export function useExecutionEngine(stepDelay = 1200) {

    // ESTADOS
    const [linhasTerminal, setLinhasTerminal] = useState([]);
    const [passoAtual, setPassoAtual] = useState(-1);
    const [errors, setErrors] = useState([]);
    const [executando, setExecutando] = useState(false);
    const [estadoOperacoes, setEstadoOperacoes] = useState({});
    const [mensagensEspera, setMensagensEspera] = useState({});

    const stepDelayRef = useRef(stepDelay);
    const stoppedByUserRef = useRef(false);
    const engineRef = useRef(null);
    const highestIndexRef = useRef(-1);


    // helpers internos
    const advancePasso = (index) => {
        if (typeof index !== "number") return;
        if (index > highestIndexRef.current) {
            highestIndexRef.current = index;
            setPassoAtual(index);
        }
    };

    const resetUI = () => {
        setLinhasTerminal([]);
        setPassoAtual(-1);
        setErrors([]);
        setExecutando(false);
        setEstadoOperacoes({});
        setMensagensEspera({});
        highestIndexRef.current = -1;
        engineRef.current = null;
    };


    // Normalização das instruções
    const normalizarInstrucoes = (instrRaw) => {
        return instrRaw.map((op) => {
            if (typeof op !== "string") return op;

            const partes = op.split(":").map((p) => p.trim());

            if (partes.length === 2) {
                const tipo = partes[1];
                const conhecidos = ["RL", "WL", "R", "W", "U", "Commit"];

                if (conhecidos.includes(tipo)) return op;
                if (tipo.includes("=")) return op;

                if (/^[A-Za-z0-9_]+$/.test(tipo)) {
                    return `${partes[0]}:W:${tipo}`;
                }
            }
            return op;
        });
    };


    // Processamento de erros do Verifier
    const processarErros = (instrucoes, resultadoErros) => {
        const erroPorIndice = Array(instrucoes.length).fill(false);

        resultadoErros?.forEach((e) =>
            e.indices?.forEach((i) => (erroPorIndice[i] = true))
        );

        setErrors(erroPorIndice);
        return erroPorIndice;
    };


    // Listeners: registro e limpeza
    const registrarListeners = (engine, erroPorIndice, resultadoErros, instrucoes) => {
        const listeners = [];

        const on = (ev, fn) => {
            engine.on(ev, fn);
            listeners.push({ ev, fn });
        };

        const cleanup = () => {
            if (!engine.off) return;
            listeners.forEach(({ ev, fn }) => engine.off(ev, fn));
        };

        // Evento: EXECUTION
        on("execute", ({ index, instrucao }) => {
            advancePasso(index);

            if (erroPorIndice[index]) {
                const e = resultadoErros.find((err) => err.indices?.includes(index));
                const msg = e?.nome || e?.name || e?.message || "Erro desconhecido";

                setLinhasTerminal((prev) => [...prev, { texto: `❌ ${msg}`, isErro: true }]);
                setEstadoOperacoes((p) => ({ ...p, [index]: "executado" }));
                setMensagensEspera((p) => {
                    const c = { ...p };
                    delete c[index];
                    return c;
                });
                return;
            }

            setLinhasTerminal((prev) => [...prev, { texto: instrucao, isErro: false }]);
            setEstadoOperacoes((p) => ({ ...p, [index]: "executado" }));
            setMensagensEspera((p) => {
                const c = { ...p };
                delete c[index];
                return c;
            });
        });

        // Evento: WAIT
        on("wait", ({ index, instrucao, mensagem }) => {
            advancePasso(index);

            setLinhasTerminal((prev) => [
                ...prev,
                { texto: `⏸️ ${mensagem}`, isErro: false },
            ]);

            setEstadoOperacoes((p) => ({ ...p, [index]: "esperando" }));
            setMensagensEspera((p) => ({ ...p, [index]: mensagem || `${instrucao} aguardando...` }));
        });

        // Evento: GRANT
        on("grant", (g) => {
            const grants = Array.isArray(g) ? g : g ? [g] : [];
            if (!grants.length) return;

            setLinhasTerminal((prev) => [
                ...prev,
                ...grants.map((item) => ({
                    texto: `🔓 Lock concedido: ${item.tid} em ${item.item}`,
                    isErro: false,
                })),
            ]);
        });

        // Evento: FINISH
        on("finish", ({ success }) => {
            if (stoppedByUserRef.current) {
                stoppedByUserRef.current = false;
                cleanup();
                engineRef.current = null;
                setExecutando(false);
                return;
            }

            const houveErros = erroPorIndice.some(Boolean);
            const deadlocks = (resultadoErros || []).filter((e) =>
                e.name?.toLowerCase().includes("deadlock")
            );

            if (deadlocks.length > 0) processarDeadlocks(deadlocks);

            processarFinalizacaoMensagem(houveErros, success, resultadoErros, instrucoes);

            cleanup();
            engineRef.current = null;
            setExecutando(false);
        });

        // Evento: STOP
        on("stop", () => {
            stoppedByUserRef.current = true;

            setLinhasTerminal((prev) => [...prev, { texto: "⏹ Execução interrompida.", isErro: true }]);

            setExecutando(false);
            setEstadoOperacoes({});
            setMensagensEspera({});
            highestIndexRef.current = -1;

            cleanup();
            engineRef.current = null;
        });

        return cleanup;
    };


    // Funções auxiliares de finalização
    const processarDeadlocks = (deadlocks) => {
        const linhas = deadlocks
            .flatMap((e) => e.indices || [])
            .sort((a, b) => a - b)
            .map((l) => l + 1);

        const ciclos = deadlocks.map((e) => {
            const raw = e.name;
            return raw.substring(raw.indexOf("Ciclo"));
        });

        if (deadlocks.length === 1) {
            setLinhasTerminal((prev) => [
                ...prev,
                { texto: `\n❌ Deadlock iniciado na linha: ${linhas[0]}`, isErro: true },
                { texto: `🔁 ${ciclos[0]}`, isErro: false },
            ]);
        } else {
            setLinhasTerminal((prev) => [
                ...prev,
                { texto: `\n🌀 Ciclos encontrados: ${deadlocks.length}`, isErro: true },
                { texto: `❌ Deadlocks iniciados nas linhas: ${linhas.join(" e ")}`, isErro: true },
                { texto: `🔁 ${ciclos.join(" e ")}`, isErro: false },
            ]);
        }
    };


    const processarFinalizacaoMensagem = (houveErros, success, resultadoErros, instrucoes) => {
        if (houveErros) {
            const transacoesComErro = resultadoErros
                .flatMap((e) => e.indices || [])
                .map((i) => instrucoes[i].split(":")[0]);

            const unicos = [...new Set(transacoesComErro)];

            const extra = unicos.length
                ? ` \n❌ ${unicos.join(", ")} não foram finalizadas.`
                : "";

            setLinhasTerminal((prev) => [
                ...prev,
                { texto: `\n❌ Execução finalizada com erros.${extra}`, isErro: true },
            ]);
        } else if (success) {
            setLinhasTerminal((prev) => [
                ...prev,
                { texto: "🏁 Execução finalizada com sucesso.", isErro: false },
            ]);
        } else {
            setLinhasTerminal((prev) => [
                ...prev,
                { texto: "❌ Execução finalizada com erros.", isErro: true },
            ]);
        }
    };


    // INICIAR EXECUÇÃO
    const iniciarExecucao = (instrRaw) => {
        if (!instrRaw?.length) return;

        const instrucoes = normalizarInstrucoes(instrRaw);
        const { errors: resultadoErros } = verifier(instrucoes);

        const erroPorIndice = processarErros(instrucoes, resultadoErros);

        setEstadoOperacoes({});
        setMensagensEspera({});
        setLinhasTerminal([{ texto: "🟡 Iniciando execução...", isErro: false }]);

        highestIndexRef.current = -1;
        setPassoAtual(-1);
        setExecutando(true);

        stoppedByUserRef.current = false;

        const engine = new ExecutionEngine(instrucoes, scheduler, {
            stepDelay: stepDelayRef.current,
        });

        engineRef.current = engine;
        registrarListeners(engine, erroPorIndice, resultadoErros, instrucoes);

        engine.start();
    };


    // PARAR EXECUÇÃO
    const pararExecucao = () => {
        if (engineRef.current) {
            stoppedByUserRef.current = true;
            engineRef.current.stop();
        }
        setExecutando(false);
        highestIndexRef.current = -1;
    };


    // ALTERAR VELOCIDADE EM EXECUÇÃO
    const setStepDelay = (ms) => {
        const safe = Math.max(50, Math.floor(Number(ms) || 0));
        stepDelayRef.current = safe;

        if (engineRef.current?.setStepDelay)
            engineRef.current.setStepDelay(safe);
    };


    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            if (engineRef.current) engineRef.current.stop();
            highestIndexRef.current = -1;
        };
    }, []);


    // Retorno do hook organizado
    return {
        iniciarExecucao,
        pararExecucao,
        resetUI,
        setStepDelay,
        linhasTerminal,
        passoAtual,
        errors,
        executando,
        estadoOperacoes,
        mensagensEspera,
    };
}
