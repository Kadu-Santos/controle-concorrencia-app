import './RunPage.css';

import Navbar from '../../components/Navbar/Navbar';
import NumericDropdown from '../../components/NumericDropdown/NumericDropdown';
import HintButton from '../../components/HintButton/HintButton';
import InputList from '../../components/InputList.js/InputList';
import ButtonC from '../../components/button/ButtonC';
import Table from '../../components/Table/Table';
import Toggle from '../../components/Toggle/Toggle';
import Terminal from '../../components/Terminal/Terminal';
import Footer from '../../components/Footer/Footer';
import { format } from '../../utils/Valid';
import ResultTable from '../../components/ResultTable/ResultTable';
import SpeedControl from '../../components/SpeedControl/SpeedControl';
import ScheduleEditor from '../../components/ScheduleEditor/ScheduleEditor';
import ExampleDropdown from '../../components/ExampleDropdown/ExampleDropdown';

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
        setValor, setOperacoesExecucao, setOperacoes,
        setExpressoes,

        onSpeedChange,
        executarExemplo,
        limparTudo,
        getStatus,
        dropAtivo,
        getNamesExemples
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
                            disabled={executando}
                        />

                        <p>Número de variáveis:</p>
                        <HintButton texto="Número de variáveis" />
                        <NumericDropdown
                            options={nOpVarivavel}
                            onSelect={setNumVariaveis}
                            selectedValue={numVariaveis}
                            disabled={executando}
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
                            disabled={executando}
                        />

                        <p>Valores iniciais:</p>
                        <InputList
                            quantidade={valor ? numVariaveis : 0}
                            onChange={setValoresVariaveis}
                            valoresIniciais={valoresVariaveis}
                            disabled={executando}
                        />

                        <SpeedControl
                            speedMs={speedMs}
                            onSpeedChange={onSpeedChange}
                        />
                    </div>

                    <div className="dividerBox">
                        <p className='titleDivider'>Como rodar um exemplo?</p>
                        <p className='istructionText'>Escolha um exemplo na lista ou clique em "Exemplo Aleatório"
                            para preencher tudo automaticamente. Depois, basta clicar em
                            "Gerar" para iniciar a execução.</p>

                        <div className='selectExemple'>
                            <ExampleDropdown
                                examples={getNamesExemples()}
                                onSelect={(index) => { executarExemplo(index) }}
                                disabled={executando}
                            />

                            <ButtonC
                                texto="EX. ALEATÓRIO"
                                corFundo="#007bff"
                                corTexto="#fff"
                                onClick={executarExemplo}
                                ativo={!executando}
                                fontSize='20px'
                                width='220px'
                                height='45px'
                            />
                        </div>
                    </div>
                </div>


                {/* --------------------- CRONOGRAMA --------------------- */}
                <h3 className='SubTitle'>Insira o Cronograma</h3>

                <div className="dropdownsContainer">
                    <ScheduleEditor
                        operacoes={operacoes}
                        expressoes={expressoes}
                        onChangeOperacoes={(next) => setOperacoes(next)}
                        onChangeExpressoes={(next) => setExpressoes(next)}
                        numTransacoes={numTransacoes}
                        numVariaveis={numVariaveis}
                        disable={!dropAtivo()}
                    />

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