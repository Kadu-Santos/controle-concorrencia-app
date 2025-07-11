import React from "react";
import "./IntegranteCard.css";

import githubLogo from "../../assets/GithubLogo.png";
import linkedinLogo from "../../assets/LinkedinLogo.png";
import instagramLogo from "../../assets/InstagramLogo.png";

function IntegranteCard({ nome, funcao, foto, github, linkedin, instagram }) {
    return (
        <div className="integrante-card">
            <img src={foto} alt={`Foto de ${nome}`} className="integrante-foto" />
            <div className="integrante-info">
                <h2 className="integrante-nome">{nome}</h2>
                <p className="integrante-funcao">{funcao}</p>
                <div className="integrante-redes">
                    <a href={github} target="_blank" rel="noopener noreferrer">
                        <img src={githubLogo} alt="GitHub" className="rede-logo" />
                    </a>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer">
                        <img src={linkedinLogo} alt="LinkedIn" className="rede-logo" />
                    </a>
                    <a href={instagram} target="_blank" rel="noopener noreferrer">
                        <img src={instagramLogo} alt="Instagram" className="rede-logo" />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default IntegranteCard;
