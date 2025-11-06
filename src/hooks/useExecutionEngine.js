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


    // novos estados para a tabela
    const [estadoOperacoes, setEstadoOperacoes] = useState({}); // { index: "esperando"|"executado" }
    const [mensagensEspera, setMensagensEspera] = useState({}); // { index: "msg" }

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

        // Normalização: converter formas curtas "Tn:VAR" -> "Tn:W:VAR"
        // Isto evita que operações como "T3:X" sejam ignoradas pelo engine/scheduler.
        const instrucoes = instrucoesRaw.map((op) => {
            if (typeof op !== 'string') return op;
            const partes = op.split(':').map(p => p.trim());
            // padrão ambíguo: duas partes e segunda parte não contém '=' e não é 'Commit'
            // e não é um tipo reconhecido (RL, WL, R, W, U, Commit)
            if (partes.length === 2) {
                const segundo = partes[1];
                const tiposReconhecidos = ['RL', 'WL', 'R', 'W', 'U', 'Commit'];
                // se o segundo for um desses, deixamos como está (ex.: "T1:Commit")
                if (tiposReconhecidos.includes(segundo)) return op;
                // se for expressão (contém '=') manter como está
                if (segundo.includes('=')) return op;
                // se for apenas um nome de variável (ex.: "X" ou "Y"), normalizar para escrita
                // transformamos em Write: "Tn:W:VAR"
                // essa escolha presume que "T3:X" representa operação que altera X (consistente com expressoes)
                if (/^[A-Za-z0-9_]+$/.test(segundo)) {
                    return `${partes[0]}:W:${segundo}`;
                }
            }
            // caso não aplicável, retorna original
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

        // reset de estados de tabela
        setEstadoOperacoes({});
        setMensagensEspera({});

        const engine = new ExecutionEngine(instrucoes, scheduler, { stepDelay: stepDelayRef.current });

        engineRef.current = engine;

        // reset passo/higher-index antes de iniciar
        highestIndexRef.current = -1;
        setPassoAtual(-1);

        setLinhasTerminal([{ texto: "🟡 Iniciando execução...", isErro: false }]);
        setExecutando(true);

        // registra eventos — usar uma cópia local de erros para evitar problemas de closure
        const errosLocal = resultadoErros || [];

        engine.on("execute", ({ index, instrucao }) => {
            advancePassoAtual(index);

            // Se instrucao tem erro de validação => mostrar só o erro (ignorar a mensagem original)
            const erro = errosLocal.find(e => e.indices?.includes(index));
            if (erro) {
                const mensagemErro = erro.nome || erro.name || erro.message || "Erro desconhecido";
                setLinhasTerminal(prev => [
                    ...prev,
                    { texto: `❌ ${mensagemErro}`, isErro: true }
                ]);
                // marcar como executado para não permanecer como aguardando
                setEstadoOperacoes(prev => ({ ...prev, [index]: "executado" }));
                // remover possível mensagem de espera (defensivo)
                setMensagensEspera(prev => {
                    const copy = { ...prev };
                    delete copy[index];
                    return copy;
                });
                return;
            }

            // Sem erro: registrar a instrução normalmente
            setLinhasTerminal((prev) => [...prev, { texto: instrucao, isErro: false }]);

            // marcar como executado (normal flow)
            setEstadoOperacoes(prev => ({ ...prev, [index]: "executado" }));
            setMensagensEspera(prev => {
                const copy = { ...prev };
                delete copy[index];
                return copy;
            });
        });

        // evento "wait" indica que a operação está bloqueada — tabela deve mostrar WaitMessage
        engine.on("wait", ({ index, instrucao, mensagem }) => {
            advancePassoAtual(index);
            // registrar linha de wait no terminal
            setLinhasTerminal((prev) => [...prev, { texto: `⏸ ${mensagem}`, isErro: true }]);

            // marcar o estado da operação como "esperando" e guardar a mensagem para a tabela
            setEstadoOperacoes(prev => ({ ...prev, [index]: "esperando" }));
            setMensagensEspera(prev => ({ ...prev, [index]: mensagem || `${instrucao} aguardando...` }));
        });

        // substitua o bloco engine.on("grant", ...) existente por este:
        engine.on("grant", (g) => {
            // grant pode ser um objeto ou array
            const grants = Array.isArray(g) ? g : (g ? [g] : []);
            if (grants.length === 0) return;

            // Apenas log imediato no terminal para feedback visual
            setLinhasTerminal((prev) => [
                ...prev,
                ...grants.map(item => ({ texto: `🔓 Lock concedido: ${item.tid} em ${item.item}`, isErro: false }))
            ]);

            // NÃO removemos mensagens de espera aqui e NÃO marcamos como executado.
            // A atualização do estado da tabela fica a cargo do evento 'execute',
            // que será emitido pelo ExecutionEngine no tempo correto.
        });



        engine.on("finish", ({ success }) => {
            setLinhasTerminal((prev) => [
                ...prev,
                {
                    texto: success
                        ? "🏁 Execução finalizada com sucesso."
                        : "❌ Execução finalizada com erros.",
                    isErro: !success,
                },
            ]);
            setExecutando(false);
        });

        engine.on("stop", () => {
            setLinhasTerminal((prev) => [...prev, { texto: "⏹ Execução interrompida.", isErro: true }]);
            setExecutando(false);

            // limpar estados de espera ao parar
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
        // expor para a Table
        estadoOperacoes,
        mensagensEspera,
        setStepDelay
    };
}
