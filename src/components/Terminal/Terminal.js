import React from 'react';
import './Terminal.css';

function formatText(texto) {
  if (texto.startsWith('Erro')) return `⚠️ ${texto}`;

  const partes = texto.split(':');
  if (partes.length === 3) {
    const [transacao, tipo, item] = partes;

    switch (tipo) {
      case 'R': return `📖 ${transacao} lê o valor de ${item}`;
      case 'W': return `✍️ ${transacao} escreve em ${item}`;
      case 'RL': return `🔐 ${transacao} solicita bloqueio de leitura sobre ${item}`;
      case 'WL': return `🔒 ${transacao} solicita bloqueio de escrita sobre ${item}`;
      case 'U': return `🔓 ${transacao} libera o recurso ${item}`;
      default: return `${transacao}:${tipo}:${item}`;
    }
  }

  if (partes.length === 2) {
    const [transacao, conteudo] = partes;
    if (conteudo === 'Commit') return `✅ ${transacao} confirma todas as operações`;
    if (conteudo.includes('=')) return `🧮 ${transacao} executa: ${conteudo}`;
  }

  return texto;
}


function Terminal({ linhas = [] }) {
  const corpoRef = React.useRef(null);
  const [mostrarCursor, setMostrarCursor] = React.useState(true);

  React.useEffect(() => {
    if (corpoRef.current) {
      corpoRef.current.scrollTop = corpoRef.current.scrollHeight;
    }
  }, [linhas]);

  React.useEffect(() => {
    const intervalo = setInterval(() => {
      setMostrarCursor(prev => !prev);
    }, 500);
    return () => clearInterval(intervalo);
  }, []);

  const getClasse = (linha) => {
    if (linha.isErro) return 'erro';

    if (linha.texto.trim().startsWith('⏸') || linha.texto.trim().startsWith('⏳')) {
      return 'espera';
    }

    if (!linha.texto) return '';

    const partes = linha.texto.split(':');
    if (partes.length < 2) return '';

    if (partes[1].toLowerCase() === 'commit') return 'commit';
    if (partes[1].toLowerCase() === 'u') return 'unlock';
    return '';

  };

  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
      </div>
      <div className="terminal-body" ref={corpoRef}>
        {linhas.length > 0 ? (
          linhas.map((linha, idx) => (
            <p key={idx} className={getClasse(linha)}>
              {formatText(linha.texto)}
            </p>
          ))
        ) : (
          <p className="cursor">{mostrarCursor ? '_' : ''}</p>
        )}
      </div>
    </div>
  );
}

export default Terminal;
