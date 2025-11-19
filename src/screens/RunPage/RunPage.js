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
import { format, isOperacaoMatematica } from '../../utils/Valid';
import ResultTable from '../../components/ResultTable/ResultTable';
import SpeedControl from '../../components/SpeedControl/SpeedControl';

import { useRunPageState } from '../../hooks/useRunPageState';

// Opções numéricas para dropdowns
const nOpTransacao = [1, 2, 3, 4];
const nOpVarivavel = ['1 (x)', '2 (x, y)', '3 (x, y, z)', '4 (x, y, z, w)'];

function RunPage() {
    const {
        speedMs, numVariaveis, numTransacoes,
        valoresVariaveis, operacoes, expressoes, valor,
        operacoesExecucao, botaoAtivo,

        iniciarExecucao, pararExecucao, linhasTerminal,
        passoAtual, errors, executando, estadoOperacoes,
        mensagensEspera,

        setNumVariaveis, setNumTransacoes, setValoresVariaveis,
        setValor, setOperacoesExecucao,

        onSpeedChange, atualizarOperacao, handleOperacaoChange,
        adicionarOperacao, removerOperacao,
        executarExemploAleatorio, limparTudo, getStatus
    } = useRunPageState();

    return (
        <div className="bodyRunPage">

            <Navbar />
            <div className="background-image-1"></div>
            <div className="background-image-2"></div>

            <div className="runPage-container">

                <h2 className='Title'>Visualizador de Controle de Concorrência</h2>
                <h3 className='SubTitle'>Configure a execução de suas transações</h3>

                {/* --------------------- CONFIG --------------------- */}
                <div className="dividerContainer">

                    <div className="dividerBox">
                        <p className='titleDivider'>Configuração de execução</p>

                        <p>Número de transações:</p>
                        <HintButton texto="Aqui você pode visualizar detalhes." />
                        <NumericDropdown
                            options={nOpTransacao}
                            onSelect={setNumTransacoes}
                            selectedValue={numTransacoes}
                        />

                        <p>Número de variáveis:</p>
                        <HintButton texto="Número de variáveis" />
                        <NumericDropdown
                            options={nOpVarivavel}
                            onSelect={setNumVariaveis}
                            selectedValue={numVariaveis}
                        />
                    </div>

                    <div className="dividerBox">
                        <p className='titleDivider'>Preencher valores iniciais?</p>

                        <Toggle
                            valor={valor}
                            onChange={(v) => {
                                setValor(v);
                                if (v) setValoresVariaveis(Array(numVariaveis).fill(''));
                            }}
                        />

                        <p>Valores iniciais:</p>
                        <InputList
                            quantidade={valor ? numVariaveis : 0}
                            onChange={setValoresVariaveis}
                            valoresIniciais={valoresVariaveis}
                        />

                        <SpeedControl
                            speedMs={speedMs}
                            onSpeedChange={onSpeedChange}
                        />
                    </div>

                    <div className="dividerBox">
                        <p className='titleDivider'>Como rodar um exemplo?</p>
                        <p>Ao clicar em "Gerar Exemplo", será gerado um exemplo aleatório e
                            os campos de configuração de execução serão preenchidos automaticamente.
                            Em seguida, clique em "Gerar" para iniciar a execução.</p>

                        <ButtonC
                            texto="GERAR EXEMPLO"
                            corFundo="#007bff"
                            corTexto="#fff"
                            onClick={executarExemploAleatorio}
                            ativo
                        />
                    </div>

                </div>


                {/* --------------------- CRONOGRAMA --------------------- */}
                <h3 className='SubTitle'>Insira o Cronograma</h3>

                <div className="dropdownsContainer">
                    <div className="dropdownsBox">

                        <p>S1:</p>

                        {operacoes.map((opStr, i) => {
                            const isOp = isOperacaoMatematica(opStr, numVariaveis);
                            return (
                                <div key={i} className="dropdown-item" id={`dropdown-${i}`}>

                                    <MultiLevelDropdown
                                        transactionCount={numTransacoes}
                                        variableCount={numVariaveis}
                                        onSelect={(v) => atualizarOperacao(i, v)}
                                        selectedValue={opStr}
                                        disabled={executando || (valor && valoresVariaveis.length !== numVariaveis)}
                                    />

                                    {isOp && (
                                        <>
                                            <Operation
                                                numVariaveis={numVariaveis}
                                                onOperacaoChange={handleOperacaoChange(i)}
                                                valorInicial={expressoes[i]}
                                            />
                                            <span className='pontoVirgula'>;</span>
                                        </>
                                    )}

                                    {!isOp && <span className='pontoVirgula'>;</span>}

                                    {i === operacoes.length - 1 && (
                                        <DropdownControlButtons
                                            onAdd={() => opStr.trim() && adicionarOperacao()}
                                            onRemove={() => operacoes.length > 1 && removerOperacao(i)}
                                            podeAdicionar={opStr.trim()}
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
                                const instr = format(operacoes, expressoes, numVariaveis);
                                setOperacoesExecucao(instr);
                                iniciarExecucao(instr);
                            }}
                            ativo={botaoAtivo && !executando}
                        />

                        <ButtonC
                            texto={executando ? "PARAR" : "LIMPAR"}
                            corFundo={executando ? "#dc3545" : "#6c757d"}
                            corTexto="#fff"
                            onClick={() => executando ? pararExecucao() : limparTudo()}
                            ativo={executando || operacoes.some(op => op.trim())}
                        />

                    </div>
                </div>


                {/* --------------------- EXECUÇÃO --------------------- */}
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


                {/* --------------------- RESULTADO --------------------- */}
                <h3 className='SubTitle'>Resultado</h3>

                <div className='ResultTableContainer'>
                    <ResultTable
                        status={getStatus()}
                        operacoes={operacoesExecucao}
                        valoresIniciais={valoresVariaveis}
                    />
                </div>

                <Footer />

            </div>
        </div>
    );
}

export default RunPage;