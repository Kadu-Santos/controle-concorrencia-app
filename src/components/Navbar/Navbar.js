import React from 'react';
import './Navbar.css';
import Logo from '../../assets/icons/logo-visualiza.png'

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo à esquerda */}
      <div className="navbar-logo">
        <img src={Logo} alt="Logo Visualiza" className="logo-image" />
      </div>

      {/* Espaço central */}
      <div className="navbar-space"></div>

      {/* Opções à direita */}
      <ul className="navbar-links">
        <li><a href="#home">Início</a></li>
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
