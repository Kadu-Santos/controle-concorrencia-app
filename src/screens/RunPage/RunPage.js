import { useState, useCallback, useMemo } from 'react';
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
import { exemplos } from '../../data/exemples';

import { format, isOperacaoMatematica } from '../../utils/Valid';
import verificador from '../../utils/verifier';
import ResultTable from '../../components/ResultTable/ResultTable'

function RunPage() {
    const [numVariaveis, setNumVariaveis] = useState(0);
    const [numTransacoes, setNumTransacoes] = useState(0);
    const [valoresVariaveis, setValoresVariaveis] = useState([]);
    const [operacoes, setOperacoes] = useState([""]);
    const [expressoes, setExpressoes] = useState({});
    const [valor, setValor] = useState(false);
    const [operacoesExecucao, setOperacoesExecucao] = useState([]);

    const [passoAtual, setPassoAtual] = useState(-1);
    const [linhasTerminal, setLinhasTerminal] = useState([]);
    const [errors, setErrors] = useState([]);


    const withNum = valor ? numVariaveis : 0;

    const executarExemploAleatorio = () => {
        const exemplo = exemplos[Math.floor(Math.random() * exemplos.length)];

        setNumTransacoes(exemplo.numTransacoes);
        setNumVariaveis(exemplo.numVariaveis);
        setValoresVariaveis(exemplo.valoresVariaveis);
        setOperacoes(exemplo.operacoes);
        setExpressoes(exemplo.expressoes);

        const temValores = exemplo.valoresVariaveis?.length > 0;
        setValor(temValores);

    };

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

        const { errors: resultadoErros, indicesWithError } = verificador(instrucoes);

        setLinhasTerminal([{ texto: "🟡 Iniciando execução...", isErro: false }]);
        setErrors(indicesWithError);
        setPassoAtual(-1);

        let i = 0;
        const executarPasso = () => {
            if (i >= instrucoes.length) {
                const houveErros = resultadoErros.length > 0;
                setLinhasTerminal(prev => [
                    ...prev,
                    {
                        texto: houveErros ? "❌ Execução finalizada com erros." : "🏁 Execução finalizada com sucesso.",
                        isErro: houveErros
                    }
                ]);

                return;
            }

            const instrucao = instrucoes[i];
            const errosNoPasso = resultadoErros.filter(e => e.indices.includes(i));

            const mensagensErro = [];
            errosNoPasso.forEach(e => {
                if (Array.isArray(e.nome)) {
                    e.nome.forEach((msg, idx) => {
                        if (e.indices[idx] === i) {
                            mensagensErro.push(`⚠️ Erro: ${msg}`);
                        }
                    });
                } else {
                    mensagensErro.push(`⚠️ Erro: ${e.nome}`);
                }
            });

            setPassoAtual(i)

            const novasLinhas = [
                ...mensagensErro.map(texto => ({ texto, isErro: true }))
            ];

            if (mensagensErro.length === 0) {
                novasLinhas.unshift({ texto: instrucao, isErro: false });
            }


            setLinhasTerminal(prev => [...prev, ...novasLinhas]);

            i++;
            setTimeout(executarPasso, 1500);
        };
        executarPasso();
    };

    const botaoAtivo = useMemo(() => {
        if (numVariaveis === 0 || numTransacoes === 0) return false;

        const variaveisPreenchidas =
            valoresVariaveis.length === numVariaveis &&
            valoresVariaveis.every(v => v.trim() !== '');

        const variaveisOk = valor ? variaveisPreenchidas : true;

        const operacoesOk = operacoes.every((op, index) => {
            if (!op?.trim()) return false;
            const precisaExpressao = isOperacaoMatematica(op, numVariaveis);
            return !precisaExpressao || (expressoes[index]?.trim() !== '');
        });

        return variaveisOk && operacoesOk;
    }, [numVariaveis, numTransacoes, valoresVariaveis, operacoes, expressoes, valor]);

    const nOpTransacao = [1, 2, 3, 4]
    const nOpVarivavel = ['1 (x)', '2 (x,y)', '3 (x,y,z)']

    return (
        <div className="runPage-container">
            <Logo />
            <h2 className='Title'>Simulador de Controle de Concorrência</h2>
            <h3 className='SubTitle'>Configure a execução de suas transações</h3>

            <div className="dividerBox">
                <div className="divider">
                    <p>Configuração de execução</p>
                    <p>Número de transações:</p>
                    <HintButton texto="Aqui você pode visualizar detalhes do controle de concorrência." />

                    <NumericDropdown
                        opcoes={nOpTransacao}
                        onChange={(v) => setNumTransacoes(v)}
                        value={numTransacoes}
                    />

                    <p>Número de variáveis:</p>
                    <HintButton texto="Número de variáveis" />
                    <NumericDropdown
                        opcoes={nOpVarivavel}
                        onChange={(v) => setNumVariaveis(v)}
                        value={numVariaveis}
                        largura="110px"
                    />

                </div>

                <div className="divider">
                    <p>Preencher valores iniciais das variáveis?</p>
                    <Toggle
                        valor={valor}
                        onChange={(novoValor) => {
                            setValor(novoValor);
                            if (novoValor) {
                                setValoresVariaveis(Array(numVariaveis).fill(''));
                            }
                        }}
                    />


                    <p>Valores iniciais das variáveis:</p>
                    <InputList
                        quantidade={withNum}
                        onChange={setValoresVariaveis}
                        valoresIniciais={valoresVariaveis}
                    />

                </div>

                <div className="divider">
                    <p>Como rodar um exemplo?</p>
                    <p>
                        Ao clicar em "Gerar Exemplo", será gerado um exemplo aleatório e
                        os campos de configuração de execução serão preenchidos automaticamente.
                        Em seguida, clique em "Gerar" para iniciar a simulação.
                    </p>
                    <ButtonC
                        texto="GERAR EXEMPLO"
                        corFundo="#007bff"
                        corTexto="#fff"
                        onClick={executarExemploAleatorio}
                        ativo={true}
                    />

                </div>
            </div>

            <br />
            <br />

            <h3 className='SubTitle'>Insira o Cronograma de execução</h3>

            <div className="boxRun">

                <div className="dropdowns-container">
                    <p>S1:</p>
                    {operacoes.map((opStr, i) => {
                        const isOp = isOperacaoMatematica(opStr, numVariaveis);
                        return (
                            <div key={i} className="dropdown-item">
                                <MultiLevelDropdown
                                    numTransacoes={numTransacoes}
                                    numVariaveis={numVariaveis}
                                    onSelecionar={(val) => atualizarOperacao(i, val)}
                                    valorSelecionado={opStr}
                                    disabled={valor && !(valoresVariaveis.length === numVariaveis)}
                                />

                                {isOp && (
                                    <Operation
                                        numVariaveis={numVariaveis}
                                        onOperacaoChange={handleOperacaoChange(i)}
                                        valorInicial={expressoes[i]}
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
                    onClick={() => {
                        const instr = format(operacoes, expressoes, numVariaveis);
                        setOperacoesExecucao(instr);
                        iniciarExecucao();
                    }}
                    ativo={botaoAtivo}
                />

            </div>




            <div className='Excution'>
                <Table
                    operacoes={operacoesExecucao}
                    errors={errors}
                    passoAtual={passoAtual}
                />

                <Terminal linhas={linhasTerminal} />
            </div>

            {console.log(format(operacoes, expressoes, numVariaveis))}

            <br />
            <br />
            <h3 className='SubTitle'>Resultado da execução</h3>
            <br />

            <ResultTable
                ativa={withNum}
                operacoes={format(operacoes, expressoes, numVariaveis)}
                valoresIniciais={valoresVariaveis}
            />

            <br />
            <br />
            <br />
            <br />
            <br />
            <br />


        </div>
    );
}

export default RunPage;
