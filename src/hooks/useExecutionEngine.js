import { useState, useRef, useEffect } from "react";
import { ExecutionEngine } from "../engine/ExecutionEngine";
import scheduler from '../engine/Scheduler';
import verifier from '../utils/Verifier';

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

        // ======== Normalização das instruções ============
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

        // ======== Validação inicial ============
        const { errors: resultadoErros } = verifier(instrucoes);

        // erroPorIndice: array booleana local
        const erroPorIndice = Array(instrucoes.length).fill(false);
        (resultadoErros || []).forEach(e => {
            e.indices?.forEach(i => {
                erroPorIndice[i] = true;
            });
        });

        // Atualiza UI
        setErrors(erroPorIndice);
        setEstadoOperacoes({});
        setMensagensEspera({});
        setLinhasTerminal([{ texto: "🟡 Iniciando execução...", isErro: false }]);
        highestIndexRef.current = -1;
        setPassoAtual(-1);
        setExecutando(true);

        stoppedByUserRef.current = false;

        // ======== Criação do engine ============
        const engine = new ExecutionEngine(instrucoes, scheduler, { stepDelay: stepDelayRef.current });

        // GUARDA engine
        engineRef.current = engine;

        // ======== SISTEMA DE LIMPEZA DE LISTENERS ============
        // Guardamos handlers para remover no final
        const listeners = [];

        const on = (event, handler) => {
            engine.on(event, handler);
            listeners.push({ event, handler });
        };

        const cleanupListeners = () => {
            if (!engine.off) return; // caso a implementação não suporte off()
            listeners.forEach(({ event, handler }) => {
                engine.off(event, handler);
            });
        };

        // ======== Handlers ============
        on("execute", ({ index, instrucao }) => {
            advancePassoAtual(index);

            const erro = erroPorIndice[index];
            if (erro) {
                const erroObj = resultadoErros.find(e => e.indices?.includes(index));
                const mensagemErro = erroObj?.nome || erroObj?.name || erroObj?.message || "Erro desconhecido";

                setLinhasTerminal(prev => [
                    ...prev,
                    { texto: `❌ ${mensagemErro}`, isErro: true }
                ]);

                setEstadoOperacoes(prev => ({ ...prev, [index]: "executado" }));
                setMensagensEspera(prev => { const c = { ...prev }; delete c[index]; return c; });

                return;
            }

            setLinhasTerminal(prev => [...prev, { texto: instrucao, isErro: false }]);
            setEstadoOperacoes(prev => ({ ...prev, [index]: "executado" }));
            setMensagensEspera(prev => { const c = { ...prev }; delete c[index]; return c; });
        });

        on("wait", ({ index, instrucao, mensagem }) => {
            advancePassoAtual(index);

            setLinhasTerminal(prev => [
                ...prev,
                { texto: `⏸️ ${mensagem}`, isErro: false }
            ]);

            setEstadoOperacoes(prev => ({ ...prev, [index]: "esperando" }));
            setMensagensEspera(prev => ({ ...prev, [index]: mensagem || `${instrucao} aguardando...` }));
        });

        on("grant", (g) => {
            const grants = Array.isArray(g) ? g : (g ? [g] : []);
            if (grants.length === 0) return;

            setLinhasTerminal(prev => [
                ...prev,
                ...grants.map(item => ({
                    texto: `🔓 Lock concedido: ${item.tid} em ${item.item}`,
                    isErro: false
                }))
            ]);
        });

        // ========== FINALIZAÇÃO ==========
        on("finish", ({ success }) => {
            if (stoppedByUserRef.current) {
                stoppedByUserRef.current = false;
                cleanupListeners();
                engineRef.current = null;
                setExecutando(false);
                return;
            }

            const houveErros = erroPorIndice.some(Boolean);

            // =============================================
            // Consolidar mensagens de deadlock
            // =============================================
            const deadlocksDetectados = (resultadoErros || [])
                .filter(e => e.name?.toLowerCase().includes("deadlock"));

            if (deadlocksDetectados.length > 0) {
                const linhas = deadlocksDetectados
                    .flatMap(e => e.indices || [])
                    .sort((a, b) => a - b)
                    .map(l => l + 1);

                const ciclos = deadlocksDetectados.map(e => {
                    const cicloBruto = e.name;
                    return cicloBruto.substring(cicloBruto.indexOf("Ciclo"));
                });

                if (deadlocksDetectados.length === 1) {
                    setLinhasTerminal(prev => [
                        ...prev,
                        {
                            texto: `\n❌ Deadlock iniciado na linha: ${linhas[0]}`,
                            isErro: true
                        },
                        {
                            texto: `🔁 ${ciclos[0]}`,
                            isErro: false
                        }
                    ]);
                } else {
                    setLinhasTerminal(prev => [
                        ...prev,
                        {
                            texto: `\n🌀 Ciclos encontrados: ${deadlocksDetectados.length}`,
                            isErro: true
                        },
                        {
                            texto: `❌ Deadlocks iniciados nas linhas: ${linhas.join(" e ")}`,
                            isErro: true
                        },
                        {
                            texto: `🔁 ${ciclos.join(" e ")}`,
                            isErro: false
                        }
                    ]);
                }
            }

            // =============================================

            if (houveErros) {
                const transacoesComErro = resultadoErros
                    .flatMap(e => e.indices || [])
                    .map(i => instrucoes[i].split(":")[0]);

                const unicos = [...new Set(transacoesComErro)];

                const msgExtra = unicos.length > 0
                    ? ` \n❌ ${unicos.join(", ")} não foram finalizadas.`
                    : "";

                setLinhasTerminal(prev => [
                    ...prev,
                    { texto: `\n❌ Execução finalizada com erros.${msgExtra}`, isErro: true }
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

            cleanupListeners();
            engineRef.current = null;
            setExecutando(false);
        });

        on("stop", () => {
            stoppedByUserRef.current = true;

            setLinhasTerminal(prev => [...prev, { texto: "⏹ Execução interrompida.", isErro: true }]);

            setExecutando(false);
            setEstadoOperacoes({});
            setMensagensEspera({});
            highestIndexRef.current = -1;

            cleanupListeners();
            engineRef.current = null;
        });

        // Inicia engine
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
