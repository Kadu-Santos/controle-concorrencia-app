import React, { useState, useCallback, useEffect } from 'react';
import './RunPage.css';

import Logo from '../../components/Logo/Logo';
import NumericDropdown from '../../components/NumericDropdown/NumericDropdown';
import HintButton from '../../components/HintButton/HintButton';
import InputList from '../../components/InputList.js/InputList';
import MultiLevelDropdown from '../../components/MultiLevelDropdown/MultiLevelDropdown';
import DropdownControlButtons from '../../components/DropdownControlButtons/DropdownControlButtons';
import ButtonC from '../../components/button/ButtonC';
import Operation from '../../components/Operation/Operation';
import Table from '../../components/Table/Table';
import Toggle from '../../components/Toggle/Toggle';
import Terminal from '../../components/Terminal/Terminal';

import { format, isOperacaoMatematica } from '../../utils/Valid';
import verificador from '../../utils/verificador';
import ResultTable from '../../components/ResultTable/ResultTable'

function RunPage() {
    const [numVariaveis, setNumVariaveis] = useState(0);
    const [numTransacoes, setNumTransacoes] = useState(0);
    const [valoresVariaveis, setValoresVariaveis] = useState([]);
    const [operacoes, setOperacoes] = useState([""]);
    const [expressoes, setExpressoes] = useState({});
    const [botaoAtivo, setBotaoAtivo] = useState(false);
    const [valor, setValor] = useState(true);

    const [passoAtual, setPassoAtual] = useState(-1);
    const [linhasTerminal, setLinhasTerminal] = useState([]);
    const [errors, setErrors] = useState([]);


    const withNum = valor ? numVariaveis : 0;

    const atualizarOperacao = (index, valor) => {
        const ops = [...operacoes];
        ops[index] = valor;
        setOperacoes(ops);
    };

    const handleOperacaoChange = useCallback((index) => (val) => {
        setExpressoes(prev => ({ ...prev, [index]: val }));
    }, []);

    const adicionarOperacao = () => {
        setOperacoes([...operacoes, ""]);
    };

    const removerOperacao = (index) => {
        const novas = [...operacoes];
        novas.splice(index, 1);
        setOperacoes(novas);

        const novasExpressoes = { ...expressoes };
        delete novasExpressoes[index];
        setExpressoes(novasExpressoes);
    };

    const iniciarExecucao = () => {
        const instrucoes = format(operacoes, expressoes, numVariaveis)

        if (instrucoes.length === 0) return;

        const { erros: resultadoErros, indicesComErro } = verificador(instrucoes);

        setLinhasTerminal([{ texto: "🟡 Iniciando execução...", isErro: false }]);
        setErrors(indicesComErro);
        setPassoAtual(-1);

        let i = 0;
        const executarPasso = () => {
            if (i >= instrucoes.length) {
                setLinhasTerminal(prev => [...prev, { texto: "🏁 Execução finalizada.", isErro: false }]);
                return;
            }

            const instrucao = instrucoes[i];
            const errosNoPasso = resultadoErros.filter(e => e.indices.includes(i));

            const mensagensErro = errosNoPasso.map(e => `⚠️ Erro: ${e.nome}`);
            setPassoAtual(i)
            const novasLinhas = [
                { texto: instrucao, isErro: false },
                ...mensagensErro.map(texto => ({ texto, isErro: true }))
            ];

            setLinhasTerminal(prev => [...prev, ...novasLinhas]);

            i++;
            setTimeout(executarPasso, 1500);
        };
        executarPasso();
    };


    useEffect(() => {
        const validarTudo = () => {
            if (numVariaveis === 0 || numTransacoes === 0) return false;

            const variaveisPreenchidas = valoresVariaveis.length === numVariaveis &&
                valoresVariaveis.every(v => v.trim() !== '');

            const variaveisOk = valor ? variaveisPreenchidas : true;

            const operacoesOk = operacoes.every((op, index) => {
                if (!op?.trim()) return false;

                const precisaExpressao = isOperacaoMatematica(op, numVariaveis);
                if (!precisaExpressao) return true;

                const expr = expressoes[index];
                return typeof expr === 'string' && expr.trim() !== '';
            });

            return variaveisOk && operacoesOk;

        };

        setBotaoAtivo(validarTudo());
    }, [numVariaveis, numTransacoes, valoresVariaveis, operacoes, expressoes, valor]);


    const nOpTransacao = [1, 2, 3, 4]
    const nOpVarivavel = ['1 (x)', '2 (x,y)', '3 (x,y,z)']

    return (
        <div className="runPage-container">
            <Logo />

            <p>Configuração de execução</p>
            <p>Número de transações:</p>
            <HintButton texto="Aqui você pode visualizar detalhes do controle de concorrência." />
            <NumericDropdown opcoes={nOpTransacao} onChange={v => setNumTransacoes(parseInt(v))} />

            <p>Número de variáveis:</p>
            <HintButton texto="Número de variáveis" />
            <NumericDropdown
                opcoes={nOpVarivavel}
                onChange={v => setNumVariaveis(parseInt(v))}
                largura="110px"
            />

            <p>Preencher valores iniciais das variáveis?</p>
            <Toggle
                valor={valor}
                onChange={(novoValor) => {
                    setValor(novoValor);
                    if (novoValor) {
                        setValoresVariaveis([]);
                    }
                }}
            />

            <p>Valores iniciais das variáveis:</p>
            <InputList quantidade={withNum} onChange={setValoresVariaveis} />

            <div className="dropdowns-container">
                {operacoes.map((opStr, i) => {
                    const isOp = isOperacaoMatematica(opStr, numVariaveis);
                    return (
                        <div key={i} className="dropdown-item">
                            <MultiLevelDropdown
                                numTransacoes={numTransacoes}
                                numVariaveis={numVariaveis}
                                onSelecionar={val => atualizarOperacao(i, val)}
                                valorSelecionado={opStr}
                                disabled={!(valoresVariaveis.length === numVariaveis)}
                            />
                            {isOp && (
                                <Operation
                                    numVariaveis={numVariaveis}
                                    onOperacaoChange={handleOperacaoChange(i)}
                                    disabled={!numVariaveis}
                                />
                            )}
                            {i === operacoes.length - 1 && (
                                <DropdownControlButtons
                                    onAdd={() => {
                                        if (opStr && opStr.trim() !== '') adicionarOperacao();
                                    }}
                                    onRemove={() => {
                                        if (operacoes.length > 1) removerOperacao(i);
                                    }}
                                    podeAdicionar={
                                        !!opStr &&
                                        opStr.trim() !== '' &&
                                        (!isOp || (expressoes[i] && expressoes[i].trim() !== ''))
                                    }

                                    podeRemover={operacoes.length > 1}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <ButtonC
                texto="GERAR"
                corFundo="#409b40"
                corTexto="#fff"
                onClick={() => { iniciarExecucao() }}
                ativo={botaoAtivo}
            />

            <div className='Excution'>
                <Table
                    operacoes={format(operacoes, expressoes, numVariaveis)}
                    errors={errors}
                    passoAtual={passoAtual}
                />

                <Terminal linhas={linhasTerminal} />
            </div>

            {console.log(format(operacoes, expressoes, numVariaveis))}

            <p>Resultado da execução</p>

            <ResultTable
                ativa={withNum}
                operacoes={format(operacoes, expressoes, numVariaveis)}
                valoresIniciais={valoresVariaveis}
            />

            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>


        </div>
    );
}

export default RunPage;
