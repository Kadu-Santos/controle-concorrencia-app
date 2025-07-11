import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';


import img1 from '../../assets/Spreadsheets-rafiki 1.png';
import img2 from '../../assets/Learning-pana 1.png';

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

      <Logo/>

      <div className="boxBody">
        <div className="box1">
          <h1 className="welcomeText">Visualizador de Controle de Concorrência</h1>
          <ButtonC texto='COMEÇAR' corTexto="#f5f5f5" corFundo="#057aff" onClick={goRunPage} />
        </div>
        <div className="box2">
          <img src={img1} className="imgApresentation" alt="Apresentação 1" />
        </div>
      </div>

      <div className="boxBody">
        <div className="box2">
          <img src={img2} className="imgApresentation" alt="Apresentação 2" />
        </div>
        <div className="box1">
          <h3 className="objective">Objetivo do projeto</h3>
          <p className="objectiveText">
            Lorem ipsum dolor sit amet, consectetur adipisci elit...
          </p>
        </div>
      </div>

      <h3 className="Autors">Responsáveis pelo Projeto</h3>

      <div className="boxBody">
        <IntegranteCard
          nome="Carlos Eduardo dos Santos"
          funcao="Desenvolvedor"
          foto={img1}
          github="https://github.com/joaosilva"
          linkedin="https://linkedin.com/in/joaosilva"
          instagram="https://instagram.com/joaosilva"
        />

        <IntegranteCard
          nome="Jefferson Silva Lopes"
          funcao="Prof. Orientador"
          foto={img1}
          github="https://github.com/joaosilva"
          linkedin="https://linkedin.com/in/joaosilva"
          instagram="https://instagram.com/joaosilva"
        />
      </div>

      <Footer />
    </div>
  );
}

export default HomeScreen;
