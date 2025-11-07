import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo à esquerda */}
      <div className="navbar-logo">
        <h2>LOGO</h2>
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
