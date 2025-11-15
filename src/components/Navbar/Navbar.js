import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import Logo from '../../assets/icons/logo-visualiza.png';

function Navbar() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    navigate('/');
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // tempo para garantir que a Home carregue
  };

  return (
    <nav className="navbar">
      {/* Logo à esquerda */}
      <div className="navbar-logo" onClick={() => navigate('/')}>
        <img src={Logo} alt="Logo Visualiza" className="logo-image" />
      </div>

      {/* Espaço central */}
      <div className="navbar-space"></div>

      {/* Opções à direita */}
      <ul className="navbar-links">
        <li onClick={() => navigate('/')}>Início</li>
        <li onClick={() => scrollToSection('objetivo')}>Objetivo</li>
        <li onClick={() => scrollToSection('como-usar')}>Como usar</li>
        <li onClick={() => navigate('/RunPage')} id='destaque'>Começar</li>
      </ul>
    </nav>
  );
}

export default Navbar;
