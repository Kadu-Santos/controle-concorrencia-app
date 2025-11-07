import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';

import img2 from '../../assets/Learning-pana 1.png';
import img3 from '../../assets/users/user1.JPG';
import img4 from '../../assets/users/user2.jpeg';

import ButtonC from '../../components/button/ButtonC';
import Footer from '../../components/Footer/Footer';
import IntegranteCard from '../../components/IntegranteCard/IntegranteCard';
import Logo from '../../components/Logo/Logo';

function HomeScreen() {
  const navigate = useNavigate();

  const goRunPage = () => {
    navigate('/RunPage');
  };

  return (
    <div className="home-container">

      {/* Hero Section */}
      <Logo />
      <div className="hero">
        <h2 className="subtitle">Simulador de Controle de Concorrência</h2>
        <ButtonC texto='COMEÇAR' corTexto="#f5f5f5" corFundo="#057aff" onClick={goRunPage} />
      </div>

      {/* Objetivo */}
      <div className="boxBody">
        <div className="box2">
          <img src={img2} className="imgApresentation" alt="Apresentação 2" />
        </div>
        <div className="box1">
          <h3 className="objective">Objetivo do projeto</h3>
          <p className="objectiveText">
            Esta aplicação web interativa foi criada para auxiliar no ensino e prática do
            <strong> controle de concorrência em bancos de dados</strong>.
            Ela permite visualizar graficamente a execução de transações concorrentes,
            compreender o uso de bloqueios compartilhados e exclusivos, além de identificar
            automaticamente situações de <em>deadlock</em> e violações ao protocolo
            <em> Two-Phase Locking (2PL)</em>.
            Com exemplos práticos e animações, torna conceitos abstratos mais acessíveis,
            promovendo um aprendizado dinâmico e intuitivo.
          </p>
        </div>
      </div>

      {/* Funcionalidades */}
      <h3 className="sectionTitle">Principais Funcionalidades</h3>
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

      {/* Preview */}
      <h3 className="sectionTitle">Como usar a ferramenta</h3>
      <div className="how-to">
        <div className="step-card">
          <h4>1️⃣ Configure a execução</h4>
          <p>Defina o número de transações e variáveis, escolha se deseja preencher valores iniciais e ajuste a velocidade da execução.</p>
          {/* Aqui você pode inserir um print da tela de configuração */}
        </div>

        <div className="step-card">
          <h4>2️⃣ Insira o cronograma</h4>
          <p>Utilize os dropdowns para montar a sequência de operações de cada transação. É possível adicionar ou remover operações conforme necessário.</p>
          {/* Print da área de cronograma */}
        </div>

        <div className="step-card">
          <h4>3️⃣ Execute ou gere exemplos</h4>
          <p>Clique em <strong>GERAR</strong> para executar seu cronograma ou em <strong>GERAR EXEMPLO</strong> para visualizar um caso pré-configurado automaticamente.</p>
          {/* Print dos botões de execução */}
        </div>

        <div className="step-card">
          <h4>4️⃣ Acompanhe a execução</h4>
          <p>Observe na tabela como os bloqueios são concedidos, quais operações aguardam e quando ocorrem situações de <em>deadlock</em> ou violações ao protocolo 2PL.</p>
          {/* Print da tabela de execução */}
        </div>

        <div className="step-card">
          <h4>5️⃣ Analise os resultados</h4>
          <p>Confira o terminal lateral para mensagens de erro, alertas e logs da execução. Use o botão <strong>LIMPAR</strong> para reiniciar e testar novos cenários.</p>
          {/* Print do terminal */}
        </div>
      </div>


      {/* Equipe */}
      <h3 className="Autors">Responsáveis pelo Projeto</h3>
      <div className="boxBody">
        <IntegranteCard
          nome="Carlos Eduardo dos Santos"
          funcao="Desenvolvedor"
          foto={img4}
          github="https://github.com/Kadu-Santos"
          linkedin="https://www.linkedin.com/in/carlos-eduardo-santos-2a56aa283/"
          instagram="https://www.instagram.com/kadu.santoss_"
        />
        <IntegranteCard
          nome="Jefferson Silva Lopes"
          funcao="Prof. Orientador"
          foto={img3}
          github="https://github.com/jeffersonl22"
          linkedin="https://br.linkedin.com/in/jefferson-silva-lopes-87925a248"
          instagram="https://www.instagram.com/jeffersonl22"
        />
      </div>

      <Footer />
    </div>
  );
}

export default HomeScreen;
