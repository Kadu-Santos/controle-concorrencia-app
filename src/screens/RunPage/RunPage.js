import { useState, useCallback, useMemo } from 'react';
import './RunPage.css';


import Navbar from '../../components/Navbar/Navbar';
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
import Footer from '../../components/Footer/Footer';
import { exemplos } from '../../data/exemples';
import { format, isOperacaoMatematica } from '../../utils/Valid';
import ResultTable from '../../components/ResultTable/ResultTable';

import { useExecutionEngine } from '../../hooks/useExecutionEngine';




function RunPage() {

    const [speedMs, setSpeedMs] = useState(1200); // ms por passo padrão


    const [numVariaveis, setNumVariaveis] = useState(0);
    const [numTransacoes, setNumTransacoes] = useState(0);
    const [valoresVariaveis, setValoresVariaveis] = useState([]);
    const [operacoes, setOperacoes] = useState([""]);
    const [expressoes, setExpressoes] = useState({});
    const [valor, setValor] = useState(false);
    const [operacoesExecucao, setOperacoesExecucao] = useState([]);

    const { iniciarExecucao,
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

    // Opções numéricas para dropdowns
    const nOpTransacao = [1, 2, 3, 4];
    const nOpVarivavel = ['1 (x)', '2 (x, y)', '3 (x, y, z)', '4 (x, y, z, w)'];

    // Garantir valor numérico para numVariaveis (compatibilidade com dropdowns que possam devolver string)
    const numVarsParsed = typeof numVariaveis === 'number'
        ? numVariaveis
        : parseInt(String(numVariaveis).replace(/\D/g, ''), 10) || 0;

    const withNum = valor ? numVarsParsed : 0;

    const onSpeedChange = (newMs) => {
        setSpeedMs(newMs);
        if (setStepDelay) setStepDelay(newMs);
    };

    const getStatus = () => {
        if (withNum === 0) return "desativado";
        if (executando) return "executando";

        const instr = format(operacoes, expressoes, numVarsParsed);
        const houveAlteracao = JSON.stringify(instr) !== JSON.stringify(operacoesExecucao);

        if (operacoesExecucao.length === 0 || houveAlteracao) {
            return "desativado";
        }

        return "ativo";
    };



    const executarExemploAleatorio = () => {
        const exemplo = exemplos[Math.floor(Math.random() * exemplos.length)];

        setNumTransacoes(exemplo.numTransacoes);
        setNumVariaveis(exemplo.numVariaveis);
        setValoresVariaveis(exemplo.valoresVariaveis || []);
        setOperacoes(exemplo.operacoes || [""]);
        setExpressoes(exemplo.expressoes || {});

        const temValores = exemplo.valoresVariaveis?.length > 0;
        setValor(temValores);
    };

    const limparTudo = () => {
        setOperacoes([""]);
        setExpressoes({});
        setOperacoesExecucao([]);
        resetUI(); // limpa terminal e erros do hook
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

    const botaoAtivo = useMemo(() => {
        if (numVarsParsed === 0 || numTransacoes === 0) return false;

        const variaveisPreenchidas =
            valoresVariaveis.length === numVarsParsed &&
            valoresVariaveis.every(v => v.trim() !== '');

        const variaveisOk = valor ? variaveisPreenchidas : true;

        const operacoesOk = operacoes.every((op, index) => {
            if (!op?.trim()) return false;
            const precisaExpressao = isOperacaoMatematica(op, numVarsParsed);
            return !precisaExpressao || (expressoes[index]?.trim() !== '');
        });

        return variaveisOk && operacoesOk;
    }, [numVarsParsed, numTransacoes, valoresVariaveis, operacoes, expressoes, valor]);

    return (
        <div className="bodyRunPage">

            <Navbar />
            <div className="background-image-1"></div>
            <div className="background-image-2"></div>
            
            <div className="runPage-container">
                
                <h2 className='Title'>Visualizador de Controle de Concorrência</h2>
                <h3 className='SubTitle'>Configure a execução de suas transações</h3>

                <div className="dividerContainer">
                    <div className="dividerBox">
                        <p className='titleDivider'>Configuração de execução</p>
                        <p>Número de transações:</p>
                        <HintButton texto="Aqui você pode visualizar detalhes do controle de concorrência." />

                        <NumericDropdown
                            options={nOpTransacao}
                            onSelect={(v) => setNumTransacoes(v)}
                            selectedValue={numTransacoes}
                        />

                        <p>Número de variáveis:</p>
                        <HintButton texto="Número de variáveis" />
                        <NumericDropdown
                            options={nOpVarivavel}
                            onSelect={(v) => setNumVariaveis(v)}
                            selectedValue={numVariaveis}
                        />

                    </div>

                    <div className="dividerBox">
                        <p className='titleDivider'>Preencher valores iniciais das variáveis?</p>
                        <Toggle
                            valor={valor}
                            onChange={(novoValor) => {
                                setValor(novoValor);
                                if (novoValor) {
                                    setValoresVariaveis(Array(numVarsParsed).fill(''));
                                }
                            }}
                        />

                        <p>Valores iniciais das variáveis:</p>
                        <InputList
                            quantidade={withNum}
                            onChange={setValoresVariaveis}
                            valoresIniciais={valoresVariaveis}
                        />

                        <div className="speed-control">
                            <p className='titleDivider'>Velocidade da execução:</p>
                            <div className="speed-row">
                                <span>Lento</span>
                                <input
                                    type="range"
                                    min={100}
                                    max={3000}
                                    step={50}
                                    value={3000 - (speedMs - 100)}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        onSpeedChange(3000 - (val - 100));
                                    }}
                                    disabled={executando}
                                />
                                <span>Rápido</span>
                            </div>
                        </div>

                    </div>

                    <div className="dividerBox">
                        <p className='titleDivider'>Como rodar um exemplo?</p>
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

                <h3 className='SubTitle'>Insira o Cronograma de execução</h3>

                <div className="dropdownsContainer">

                    <div className="dropdownsBox">
                        <p>S1:</p>
                        {operacoes.map((opStr, i) => {
                            const isOp = isOperacaoMatematica(opStr, numVarsParsed);
                            return (
                                <div key={i} className="dropdown-item" id={`dropdown-${i}`}>
                                    <MultiLevelDropdown
                                        transactionCount={numTransacoes}
                                        variableCount={numVarsParsed}
                                        onSelect={(val) => atualizarOperacao(i, val)}
                                        selectedValue={opStr}
                                        disabled={executando || (valor && !(valoresVariaveis.length === numVarsParsed))}
                                    />

                                    {isOp && (
                                        <>
                                            <Operation
                                                numVariaveis={numVarsParsed}
                                                onOperacaoChange={handleOperacaoChange(i)}
                                                valorInicial={expressoes[i]}
                                                disabled={!numVarsParsed}
                                            />
                                            <span style={{ marginLeft: 6 }}>;</span>
                                        </>
                                    )}

                                    {!isOp && <span style={{ marginLeft: 6 }}>;</span>}

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


                    <div className='buttonsBox'>
                        <ButtonC
                            texto="GERAR"
                            corFundo="#409b40"
                            corTexto="#fff"
                            onClick={() => {
                                const instr = format(operacoes, expressoes, numVarsParsed);
                                setOperacoesExecucao(instr);
                                iniciarExecucao(instr);
                            }}
                            ativo={botaoAtivo && !executando}
                        />


                        <ButtonC
                            texto={executando ? "PARAR" : "LIMPAR"}
                            corFundo={executando ? "#dc3545" : "#6c757d"}
                            corTexto="#fff"
                            onClick={() => {
                                if (executando) {
                                    pararExecucao();
                                } else {
                                    limparTudo();
                                }
                            }}
                            ativo={executando || operacoes.some(op => op.trim() !== "")}
                        />

                    </div>
                </div>

                <h3 className='SubTitle'>Execução</h3>

                <div className='ExcutionContainer'>
                    <Table
                        operacoes={operacoesExecucao}
                        errors={errors}
                        passoAtual={passoAtual}
                        estadoOperacoes={estadoOperacoes}
                        mensagensEspera={mensagensEspera}
                    />

                    <Terminal linhas={linhasTerminal} />
                </div>


                <h3 className='SubTitle'>Resultado da execução</h3>


                <div className='ResultTableContainer'>
                    <ResultTable
                        status={getStatus()}
                        operacoes={operacoesExecucao}
                        valoresIniciais={valoresVariaveis}
                    />
                </div>
            

                <div className='FooterContainer'> 
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default RunPage;