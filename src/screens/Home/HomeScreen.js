// HomeScreen.jsx
import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HomeScreen.css";
import ButtonC from "../../components/button/ButtonC";
import Footer from "../../components/Footer/Footer";
import IntegranteCard from "../../components/IntegranteCard/IntegranteCard";
import Navbar from "../../components/Navbar/Navbar";
import imgIntegrante from "../../assets/users/user2.jpeg";
import imgIntegrante1 from "../../assets/users/user1.JPG";
import Imagem from "../../assets/img.png";

function HomeScreen() {
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const goRunPage = () => {
    navigate("/RunPage");
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <Navbar />
        <div className="hero-content">
          <h1 className="hero-title">
            Visualizador de <span>Controle de Concorrência</span>
          </h1>
          <p className="hero-subtitle">
            Visualize passo a passo a execução de transações concorrentes,
            compreenda o uso de bloqueios e descubra como evitar impasses em
            sistemas de banco de dados.
          </p>
          <ButtonC
            texto="COMEÇAR"
            corTexto="#fff"
            corFundo="#0056d6"
            onClick={goRunPage}
          />

          <div className="imgAbstrata_1"></div>
          <div className="imgAbstrata_2"></div>
          <div className="imgAbstrata_3"></div>
        </div>
      </section>
      <div className="home-container" id="objetivo">
        {/* Objetivo */}
        <section className="objective-section">
          <div className="text-section">
            <h3 className="sectionTitle">Objetivo do Projeto</h3>
            <p className="objectiveText">
              Esta aplicação web interativa foi criada para auxiliar no ensino e prática do controle de 
              concorrência em bancos de dados. Ela permite visualizar graficamente a execução de transações concorrentes, 
              compreender o uso de bloqueios compartilhados e exclusivos, além de identificar automaticamente situações 
              de <em>deadlock</em> e violações ao protocolo <em>Two-Phase Locking (2PL)</em>.
            </p>
          </div>
          <img src={Imagem} className="imgObjective" alt="Simulação de concorrência em bancos" />
        </section>

        {/* Conceitos Importantes */}
        <section className="concept-section">
          <h3 className="sectionTitle" id="conceitos">Entenda os conceitos</h3>

          <div className="concepts">

            <div className="concept-card">
              <h4>🔍 Conceitos de Controle de Concorrência</h4>
              <p>
                Quando várias transações acessam o banco de dados ao mesmo tempo, elas precisam fazer isso sem 
                causar erros ou resultados inesperados. O controle de concorrência garante que todas possam trabalhar 
                simultaneamente de forma segura.
              </p>
            </div>

            <div className="concept-card">
              <h4>🔒 Bloqueios (Locks)</h4>
              <p>
                Antes de acessar um dado, uma transação solicita um bloqueio para evitar conflitos.
O bloqueio de leitura (Read Lock) permite que várias transações leiam o mesmo dado simultaneamente, pois a leitura não altera o valor.
O bloqueio de escrita (Write Lock) garante exclusividade, impedindo que outras transações leiam ou escrevam o dado enquanto a escrita estiver em andamento.
              </p>
            </div>

            <div className="concept-card">
              <h4>🔁 Execução Concorrente</h4>
              <p>
                Na prática, operações de diferentes transações são executadas de forma intercalada. 
                Essa mistura é chamada de escalonamento. A ordem em que essas operações acontecem pode 
                influenciar diretamente a consistência dos dados, podendo gerar situações como leituras 
                incorretas, valores sobrescritos ou atualizações perdidas.
              </p>
            </div>

            <div className="concept-card">
              <h4>🟦 Protocolo 2PL</h4>
              <p>
                O protocolo 2PL organiza o uso de bloqueios em duas etapas. Na fase de crescimento, 
                a transação adquire todos os bloqueios necessários. Na fase seguinte, chamada de encolhimento, 
                ela começa a liberar os bloqueios, sem poder solicitar novos. Esse mecanismo reduz conflitos 
                e ajuda a garantir que o escalonamento seja seguro e consistente.
              </p>
            </div>

            <div className="concept-card">
              <h4>⚠️ Deadlock</h4>
              <p>
                Um deadlock ocorre quando duas ou mais transações ficam esperando uma pela outra para liberar um bloqueio.
                 Nenhuma delas consegue continuar, criando um impasse. Sistemas de controle de concorrência precisam 
                 identificar e resolver essas situações para evitar travamentos.
              </p>
            </div>

            <div className="concept-card">
              <h4>📊 Por que visualizar?</h4>
              <p>
                Entender concorrência apenas pela teoria pode ser difícil, pois envolve processos simultâneos e interdependentes. 
                A visualização permite acompanhar cada passo de execução, facilitando a compreensão de bloqueios, conflitos, 
                detecção de deadlocks e do comportamento geral do escalonamento.
              </p>
            </div>
          </div>
      </section>

      {/* Como usar */}
      <h3 className="sectionTitle" id="como-usar">Como usar a ferramenta</h3>

      <div className="how-to">

        {/* 1 */}
        <div className="step-row">
          <div className="step-text">
            <h4>Configure a execução</h4>
            <p>
              Defina quantas transações deseja simular, quantas variáveis estarão disponíveis
              e a velocidade da execução. Também é possível informar valores iniciais para
              cada variável.
            </p>
          </div>
          <div className="step-media">
            <img src={require("../../assets/tutorial/configuracao.gif")} alt="Configuração" />
          </div>
        </div>

        {/* 2 */}
        <div className="step-row reverse">
          <div className="step-text">
            <h4>Monte o cronograma</h4>
            <p>
              Crie a sequência de operações de cada transação. Adicione, remova ou edite
              livremente cada operação para formar o escalonamento desejado.
            </p>
          </div>
          <div className="step-media">
            <img src={require("../../assets/tutorial/cronograma.gif")} alt="Cronograma" />
          </div>
        </div>

        {/* 3 */}
        <div className="step-row">
          <div className="step-text">
            <h4>Execute ou gere exemplos automáticos</h4>
            <p>
              Execute o escalonamento para visualizar sua execução passo a passo ou gere
              exemplos automáticos com diferentes tipos de conflitos e comportamentos.
            </p>
          </div>
          <div className="step-media">
            <img src={require("../../assets/tutorial/Exemplos.gif")} alt="Exemplos" />
          </div>
        </div>

        {/* 4 */}
        <div className="step-row reverse">
          <div className="step-text">
            <h4>Acompanhe a simulação</h4>
            <p>
              Veja a aplicação de bloqueios, operações em espera, concessão de locks,
              deadlocks e o comportamento completo do cronograma ilustrado na tabela.
            </p>
          </div>
          <div className="step-media">
            <img src={require("../../assets/tutorial/tabela.gif")} alt="Tabela" />
          </div>
        </div>

        {/* 5 */}
        <div className="step-row">
          <div className="step-text">
            <h4>Analise o terminal</h4>
            <p>
              O terminal lateral explica cada etapa da execução, indicando conflitos,
              regras do protocolo 2PL, detecção de deadlock e justificativas de cada ação.
            </p>
          </div>
          <div className="step-media">
            <img src={require("../../assets/tutorial/terminal.gif")} alt="Terminal" />
          </div>
        </div>

      </div>


      {/* Equipe */}
      <h3 className="sectionTitle">Responsáveis pelo Projeto</h3>
      <div className="boxBody">
        <IntegranteCard
          nome="Carlos Eduardo dos Santos"
          funcao="Desenvolvedor"
          foto={imgIntegrante}
          github="https://github.com/Kadu-Santos"
          linkedin="https://www.linkedin.com/in/carlos-eduardo-santos-2a56aa283/"
          instagram="https://www.instagram.com/kadu.santoss_"
        />
        <IntegranteCard
          nome="Jefferson Silva Lopes"
          funcao="Prof. Orientador"
          foto={imgIntegrante1}
          github="https://github.com/jeffersonl22"
          linkedin="https://br.linkedin.com/in/jefferson-silva-lopes-87925a248"
          instagram="https://www.instagram.com/jeffersonl22"
        />
      </div>

      <Footer />
      {showBackToTop && (
        <button
          type="button"
          className="back-to-top-button"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
          <ArrowUp size={24} strokeWidth={2.5} />
        </button>
      )}
    </div>
    </div >
  );
}

export default HomeScreen;
