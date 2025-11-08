import { useState, useRef, useEffect } from "react";
import { ExecutionEngine } from "../engine/ExecutionEngine";
import scheduler from '../engine/Scheduler';
import verifier from '../utils/verifier';

export function useExecutionEngine(stepDelay = 1200) {
    const [linhasTerminal, setLinhasTerminal] = useState([]);
    const [passoAtual, setPassoAtual] = useState(-1);
    const [errors, setErrors] = useState([]);
    const [executando, setExecutando] = useState(false);
    const stepDelayRef = useRef(stepDelay);
    const stoppedByUserRef = useRef(false);


    const [estadoOperacoes, setEstadoOperacoes] = useState({});
    const [mensagensEspera, setMensagensEspera] = useState({});

    const engineRef = useRef(null);
    const highestIndexRef = useRef(-1);


    const advancePassoAtual = (index) => {
        if (typeof index !== 'number') return;
        if (index > highestIndexRef.current) {
            highestIndexRef.current = index;
            setPassoAtual(index);
        }
    };

    // Inicia a execução
    const iniciarExecucao = (instrucoesRaw) => {
        if (!instrucoesRaw || instrucoesRaw.length === 0) return;

        const instrucoes = instrucoesRaw.map((op) => {
            if (typeof op !== 'string') return op;
            const partes = op.split(':').map(p => p.trim());

            if (partes.length === 2) {
                const segundo = partes[1];
                const tiposReconhecidos = ['RL', 'WL', 'R', 'W', 'U', 'Commit'];

                if (tiposReconhecidos.includes(segundo)) return op;

                if (segundo.includes('=')) return op;
                if (/^[A-Za-z0-9_]+$/.test(segundo)) {
                    return `${partes[0]}:W:${segundo}`;
                }
            }
            return op;
        });

        const { errors: resultadoErros } = verifier(instrucoes);

        const erroPorIndice = Array(instrucoes.length).fill(false);
        (resultadoErros || []).forEach(e => {
            e.indices?.forEach(i => {
                erroPorIndice[i] = true;
            });
        });
        setErrors(erroPorIndice);

        setEstadoOperacoes({});
        setMensagensEspera({});

        const engine = new ExecutionEngine(instrucoes, scheduler, { stepDelay: stepDelayRef.current });

        engineRef.current = engine;

        highestIndexRef.current = -1;
        setPassoAtual(-1);

        setLinhasTerminal([{ texto: "🟡 Iniciando execução...", isErro: false }]);
        setExecutando(true);

        const errosLocal = resultadoErros || [];

        engine.on("execute", ({ index, instrucao }) => {
            advancePassoAtual(index);

            const erro = errosLocal.find(e => e.indices?.includes(index));
            if (erro) {
                const mensagemErro = erro.nome || erro.name || erro.message || "Erro desconhecido";
                setLinhasTerminal(prev => [
                    ...prev,
                    { texto: `❌ ${mensagemErro}`, isErro: true }
                ]);
                setEstadoOperacoes(prev => ({ ...prev, [index]: "executado" }));
                setMensagensEspera(prev => {
                    const copy = { ...prev };
                    delete copy[index];
                    return copy;
                });
                return;
            }

            setLinhasTerminal((prev) => [...prev, { texto: instrucao, isErro: false }]);

            setEstadoOperacoes(prev => ({ ...prev, [index]: "executado" }));
            setMensagensEspera(prev => {
                const copy = { ...prev };
                delete copy[index];
                return copy;
            });
        });

        engine.on("wait", ({ index, instrucao, mensagem }) => {
            advancePassoAtual(index);
            setLinhasTerminal((prev) => [...prev, { texto: `⏸ ${mensagem}`, isErro: true }]);

            setEstadoOperacoes(prev => ({ ...prev, [index]: "esperando" }));
            setMensagensEspera(prev => ({ ...prev, [index]: mensagem || `${instrucao} aguardando...` }));
        });

        engine.on("grant", (g) => {
            const grants = Array.isArray(g) ? g : (g ? [g] : []);
            if (grants.length === 0) return;

            setLinhasTerminal((prev) => [
                ...prev,
                ...grants.map(item => ({ texto: `🔓 Lock concedido: ${item.tid} em ${item.item}`, isErro: false }))
            ]);
        });

        engine.on("finish", ({ success }) => {
            if (stoppedByUserRef.current) {
                // já mostramos "Execução interrompida"
                stoppedByUserRef.current = false; // reseta para próxima execução
                return;
            }

            const houveErros = errors.some(e => e === true);

            if (houveErros) {
                const transacoesComErro = resultadoErros
                    .flatMap(e => e.indices || [])
                    .map(i => {
                        const instrucao = instrucoes[i] || "";
                        return instrucao.split(":")[0];
                    });

                const unicos = [...new Set(transacoesComErro)];
                const msgExtra = unicos.length > 0
                    ? ` As seguintes trasações não foram concluidas: ${unicos.join(", ")}`
                    : "";

                setLinhasTerminal(prev => [
                    ...prev,
                    { texto: `❌ Execução finalizada com erros.\n❌${msgExtra}`, isErro: true }
                ]);
            } else if (success) {
                setLinhasTerminal(prev => [
                    ...prev,
                    { texto: "🏁 Execução finalizada com sucesso.", isErro: false }
                ]);
            } else {
                setLinhasTerminal(prev => [
                    ...prev,
                    { texto: "❌ Execução finalizada com erros.", isErro: true }
                ]);
            }

            setExecutando(false);
        });

        engine.on("stop", () => {
            stoppedByUserRef.current = true;
            setLinhasTerminal(prev => [...prev, { texto: "⏹ Execução interrompida.", isErro: true }]);
            setExecutando(false);
            setEstadoOperacoes({});
            setMensagensEspera({});
            highestIndexRef.current = -1;
        });

        // inicia
        engine.start();
    };

    // Para execução
    const pararExecucao = () => {
        if (engineRef.current) {
            stoppedByUserRef.current = true;
            engineRef.current.stop();
        }
        setExecutando(false);
        highestIndexRef.current = -1;
    };


    const setStepDelay = (ms) => {
        const n = Number(ms) || 0;
        const safe = Math.max(50, Math.floor(n));
        stepDelayRef.current = safe;
        // se engine já existe, atualiza imediatamente
        if (engineRef.current && typeof engineRef.current.setStepDelay === 'function') {
            engineRef.current.setStepDelay(safe);
        }
    };

    const resetUI = () => {
        setLinhasTerminal([]);
        setPassoAtual(-1);
        setErrors([]);
        setExecutando(false);
        engineRef.current = null;
        setEstadoOperacoes({});
        setMensagensEspera({});
        highestIndexRef.current = -1;
    };

    // cleanup ao desmontar
    useEffect(() => {
        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
            }
            highestIndexRef.current = -1;
        };
    }, []);

    return {
        iniciarExecucao,
        pararExecucao,
        linhasTerminal,
        passoAtual,
        errors,
        executando,
        resetUI,
        estadoOperacoes,
        mensagensEspera,
        setStepDelay
    };
}
