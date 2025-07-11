import './Logo.css'
import logo from '../../assets/Logo.svg';

function Logo() {
  return (

    <div className="logo-wrapper">
      <img src={logo} className="logo-icon" alt="Logo" />
      <h1 className="logo-text">VISUALIZA</h1>
    </div>
  )
}

export default Logo;