import React from "react";
import "./Footer.css";

import logoEsquerda from "../../assets/If.png";
import logoDireita from "../../assets/mLogo.png";

function Footer() {
  return (
    <footer className="footer">
      <img src={logoEsquerda} alt="Logo Esquerda" className="footer-logo esquerda" />
      <img src={logoDireita} alt="Logo Direita" className="footer-logo direita" />
    </footer>
  );
}

export default Footer;
