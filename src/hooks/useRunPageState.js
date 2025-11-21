import { useState, useCallback, useMemo } from "react";
import { format, isOperacaoMatematica } from "../utils/Valid";
import { exemplos } from "../data/exemples";
import { useExecutionEngine } from "./useExecutionEngine";

export function useRunPageState() {

    // ESTADOS PRINCIPAIS

    const [speedMs, setSpeedMs] = useState(1200);
    const [numVariaveis, setNumVariaveis] = useState(0);
    const [numTransacoes, setNumTransacoes] = useState(0);

    const [valoresVariaveis, setValoresVariaveis] = useState([]);
    const [operacoes, setOperacoes] = useState([""]);
    const [expressoes, setExpressoes] = useState({});
    const [valor, setValor] = useState(false);

    const [operacoesExecucao, setOperacoesExecucao] = useState([]);

    // Hook de execução (engine)
    const {
        iniciarExecucao,
        pararExecucao,
        resetUI,
        linhasTerminal,
        passoAtual,
        errors,
        executando,
        estadoOperacoes,
        mensagensEspera,
        setStepDelay
    } = useExecutionEngine();


    // HANDLERS DE CONTROLE
    const onSpeedChange = (ms) => {
        setSpeedMs(ms);
        setStepDelay?.(ms);
    };

    const atualizarOperacao = (index, valor) => {
        setOperacoes((ops) =>
            ops.map((op, i) => (i === index ? valor : op))
        );
    };

    const handleOperacaoChange = useCallback(
        (index) => (val) =>
            setExpressoes((prev) => ({ ...prev, [index]: val })),
        []
    );

    const adicionarOperacao = () => setOperacoes([...operacoes, ""]);

    const removerOperacao = (index) => {
        setOperacoes((ops) => ops.filter((_, i) => i !== index));

        setExpressoes((exps) => {
            const novo = { ...exps };
            delete novo[index];
            return novo;
        });
    };


    // BOTÃO "GERAR" ATIVO?
    const botaoAtivo = useMemo(() => {
        if (!numVariaveis || !numTransacoes) return false;

        const variaveisOk =
            !valor ||
            (valoresVariaveis.length === numVariaveis &&
                valoresVariaveis.every((v) => v.trim() !== ""));

        const operacoesOk = operacoes.every((op, index) => {
            if (!op.trim()) return false;

            const precisaExpressao = isOperacaoMatematica(op, numVariaveis);
            return !precisaExpressao || expressoes[index]?.trim();
        });

        return variaveisOk && operacoesOk;
    }, [numVariaveis, numTransacoes, valoresVariaveis, operacoes, expressoes, valor]);

    const dropAtivo = () => {
        //Durante a execução sempre desativado
        if (executando) return false;

        // precisa ter número de transações definido
        if (!numTransacoes || numTransacoes <= 0) return false;

        // precisa ter número de variáveis definido
        if (!numVariaveis || numVariaveis <= 0) return false;

        // se NÃO for usar valores iniciais → pode ativar
        if (!valor) return true;

        // se for usar valores iniciais → precisa estar completo
        const preenchido = valoresVariaveis.length === numVariaveis &&
            valoresVariaveis.every(v => v.trim() !== "");

        return preenchido;
    };


    // GERAR EXEMPLO
    const executarExemplo = (index = null) => {
        const chosenIndex =
            index !== null && index >= 0 && index < exemplos.length
                ? index
                : Math.floor(Math.random() * exemplos.length);

        const e = exemplos[chosenIndex];

        setNumTransacoes(e.numTransacoes);
        setNumVariaveis(e.numVariaveis);
        setValoresVariaveis(e.valoresVariaveis || []);
        setOperacoes(e.operacoes || [""]);
        setExpressoes(e.expressoes || {});
        setValor(!!e.valoresVariaveis?.length);
    };

    // NOMES DOS EXEMPLOS
    const getNamesExemples = () => exemplos.map(ex => ex.nome);




    // LIMPAR
    const limparTudo = () => {
        setOperacoes([""]);
        setExpressoes({});
        setOperacoesExecucao([]);
        resetUI();
    };


    // STATUS DO RESULTADO
    const getStatus = () => {
        if (!valor || numVariaveis === 0) return "desativado";
        if (executando) return "executando";

        const instr = format(operacoes, expressoes, numVariaveis);
        const mudou = JSON.stringify(instr) !== JSON.stringify(operacoesExecucao);

        return operacoesExecucao.length === 0 || mudou ? "desativado" : "ativo";
    };


    // RETORNO DO HOOK
    return {
        // Estados
        speedMs, numVariaveis, numTransacoes, valoresVariaveis,
        operacoes, expressoes, valor, operacoesExecucao,

        // Derivados
        botaoAtivo,

        // Execução
        iniciarExecucao,
        pararExecucao,
        linhasTerminal,
        passoAtual,
        errors,
        executando,
        estadoOperacoes,
        mensagensEspera,

        // Handlers
        setNumVariaveis,
        setNumTransacoes,
        setValoresVariaveis,
        setValor,
        setOperacoesExecucao,
        onSpeedChange,
        atualizarOperacao,
        handleOperacaoChange,
        adicionarOperacao,
        removerOperacao,
        executarExemplo,
        limparTudo,
        getStatus,
        getNamesExemples,
        setOperacoes,
        setExpressoes,
        dropAtivo
    };
}
