import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import Logo from '../../assets/icons/logo-visualiza.png';
import { useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    navigate('/');
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="navbar-logo" onClick={() => navigate('/')}>
        <img src={Logo} alt="Logo Visualiza" className="logo-image" />
      </div>

      {/* Espaço central */}
      <div className="navbar-space"></div>

      {/* Links Desktop */}
      <ul className="navbar-links">
        <li onClick={() => navigate('/')}>Início</li>
        <li onClick={() => scrollToSection('objetivo')}>Objetivo</li>
        <li onClick={() => scrollToSection('como-usar')}>Como usar</li>
        <li onClick={() => navigate('/RunPage')} id="destaque">Começar</li>
      </ul>

      {/* Menu Hambúrguer */}
      <div className="hamburger" onClick={() => setOpen(!open)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Menu Mobile */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <li onClick={() => navigate('/')}>Início</li>
        <li onClick={() => scrollToSection('objetivo')}>Objetivo</li>
        <li onClick={() => scrollToSection('como-usar')}>Como usar</li>
        <li onClick={() => navigate('/RunPage')} id="destaque">Começar</li>
      </div>
    </nav>
  );
}

export default Navbar;
