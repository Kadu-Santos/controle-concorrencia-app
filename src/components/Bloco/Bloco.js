import React from 'react';
import './Bloco.css';


function Bloco({ texto, index, cor = 'black', pulsando = false, animacao = '' }) {

  const { texto: corTexto, fundo, borda } = cor;
  const handleClick = () => {
    const el = document.getElementById(`dropdown-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-dropdown");   // 👈 adiciona classe
      setTimeout(() => el.classList.remove("highlight-dropdown"), 2000);
    }
  };

  return (
    <div
      className={`operacao-bloco ${pulsando ? 'pulsando' : ''} ${animacao}`}
      style={{ '--c': corTexto, '--bg': fundo, borderColor: borda }}
      onClick={handleClick}
    >
      {texto}
    </div>
  );
}

export default Bloco;
