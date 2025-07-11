import React from 'react';
import './Bloco.css';

function Bloco({ texto, cor = 'black', pulsando = false, animacao = '' }) {
  return (
    <div
      className={`operacao-bloco ${pulsando ? 'pulsando' : ''} ${animacao}`}
      style={{ color: cor }}
    >
      {texto}
    </div>
  );
}

export default Bloco;
