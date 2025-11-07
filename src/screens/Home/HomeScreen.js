// HomeScreen.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';
import ButtonC from '../../components/button/ButtonC';
import Footer from '../../components/Footer/Footer';
import IntegranteCard from '../../components/IntegranteCard/IntegranteCard';
import Navbar from '../../components/Navbar/Navbar';

function HomeScreen() {
  const navigate = useNavigate();
  const goRunPage = () => {
    navigate('/RunPage');
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <Navbar />
        <div className="hero-content">
          <div className='dividerHome'>
            <h1 className="hero-title">
              Simulador de <span>Controle de Concorrência</span>
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
          </div>

          <div className='dividerHome'>
            <div className="hero-image">
              {/* Placeholder geométrico */}
              <div className="shape-circle"></div>
              <div className="shape-triangle"></div>
              <div className="shape-square"></div>
            </div>
          </div>
        </div>

      </section >
      <div className="home-container">

        {/* Objetivo */}
        < section className="objective-section" >
          <h3 className="sectionTitle">Objetivo do projeto</h3>
          <p className="objectiveText">
            Esta aplicação web interativa foi criada para auxiliar no ensino e
            prática do <strong>controle de concorrência em bancos de dados</strong>.
            Ela permite visualizar graficamente a execução de transações
            concorrentes, compreender o uso de bloqueios compartilhados e
            exclusivos, além de identificar automaticamente situações de
            <em> deadlock</em> e violações ao protocolo <em>Two-Phase Locking (2PL)</em>.
          </p>
        </section >

        {/* Funcionalidades */}
        < h3 className="sectionTitle" > Principais Funcionalidades</h3 >
        <div className="features">
          <div className="feature-card">
            <h4>🔎 Visualização gráfica</h4>
            <p>Veja passo a passo a execução de transações concorrentes.</p>
          </div>
          <div className="feature-card">
            <h4>🔒 Bloqueios</h4>
            <p>Entenda o uso de bloqueios compartilhados e exclusivos.</p>
          </div>
          <div className="feature-card">
            <h4>⚠️ Deadlock</h4>
            <p>Identificação automática de situações de impasse.</p>
          </div>
          <div className="feature-card">
            <h4>📚 Exemplos práticos</h4>
            <p>Explore casos pré-configurados para estudo guiado.</p>
          </div>
        </div>

        {/* Como usar */}
        <h3 className="sectionTitle">Como usar a ferramenta</h3>
        <div className="how-to">
          <div className="step-card">
            <h4>1️⃣ Configure a execução</h4>
            <p>Defina transações, variáveis e velocidade da execução.</p>
            <div className="shape-square"></div>
          </div>
          <div className="step-card">
            <h4>2️⃣ Insira o cronograma</h4>
            <p>Monte a sequência de operações de cada transação.</p>
            <div className="shape-circle"></div>
          </div>
          <div className="step-card">
            <h4>3️⃣ Execute ou gere exemplos</h4>
            <p>Use os botões para executar ou gerar exemplos automáticos.</p>
            <div className="shape-triangle"></div>
          </div>
          <div className="step-card">
            <h4>4️⃣ Acompanhe a execução</h4>
            <p>Observe bloqueios, operações em espera e deadlocks.</p>
            <div className="shape-square"></div>
          </div>
          <div className="step-card">
            <h4>5️⃣ Analise os resultados</h4>
            <p>Confira logs e mensagens no terminal lateral.</p>
            <div className="shape-circle"></div>
          </div>
        </div>

        {/* Equipe */}
        <h3 className="sectionTitle">Responsáveis pelo Projeto</h3>
        <div className="boxBody">
          <IntegranteCard
            nome="Carlos Eduardo dos Santos"
            funcao="Desenvolvedor"
            foto="https://via.placeholder.com/150"
            github="https://github.com/Kadu-Santos"
            linkedin="https://www.linkedin.com/in/carlos-eduardo-santos-2a56aa283/"
            instagram="https://www.instagram.com/kadu.santoss_"
          />
          <IntegranteCard
            nome="Jefferson Silva Lopes"
            funcao="Prof. Orientador"
            foto="https://via.placeholder.com/150"
            github="https://github.com/jeffersonl22"
            linkedin="https://br.linkedin.com/in/jefferson-silva-lopes-87925a248"
            instagram="https://www.instagram.com/jeffersonl22"
          />
        </div>

        <Footer />
      </div >
    </div>
  );
}

export default HomeScreen;
