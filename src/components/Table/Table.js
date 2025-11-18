import './Table.css';
import Bloco from '../Bloco/Bloco';
import WaitMessage from '../WaitMessage/WaitMessage';

const coresTransacoes = {
  T1: {
    texto: '#1E40AF',
    fundo: '#DBEAFE',
    borda: '#93C5FD',
  },
  T2: {
    texto: '#B91C1C',
    fundo: '#FEE2E2',
    borda: '#FCA5A5',
  },
  T3: {
    texto: '#6D28D9',
    fundo: '#EDE9FE',
    borda: '#C4B5FD',
  },
  T4: {
    texto: '#065F46',
    fundo: '#D1FAE5',
    borda: '#6EE7B7',
  },
};


function BarraSuperior() {
  return (
    <div className="barra-superior">
      <span className="circulo vermelho" />
      <span className="circulo amarelo" />
      <span className="circulo verde" />
    </div>
  );
}

function interpretarOperacao(op) {
  const partes = op.split(':');

  if (partes.length === 2 && partes[1].includes('=')) return partes[1];

  if (partes.length === 3) {
    const [, tipo, item] = partes;
    switch (tipo) {
      case 'R': return `read_item(${item})`;
      case 'W': return `write_item(${item})`;
      case 'RL': return `read_lock(${item})`;
      case 'WL': return `write_lock(${item})`;
      case 'U': return `unlock(${item})`;
      default: return `${tipo}(${item})`;
    }
  }

  if (partes.length === 2 && partes[1] === 'Commit') return 'commit';
  return op;
}

function Table({ operacoes, passoAtual, errors, estadoOperacoes = {}, mensagensEspera = {} }) {

  if (!operacoes || operacoes.length === 0) {
    return (
      <div className="janela-tabela">
        <BarraSuperior />
        <div className="conteudo-tabela vazio">
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            Nenhuma execução iniciada ainda.
          </p>
        </div>
      </div>
    );
  }

  const transacoes = Array.from(new Set(operacoes.map(op => op.split(':')[0])));
  const linhas = [];
  const totalLinhas = operacoes.length === 0 ? 9 : operacoes.length;

  for (let i = 0; i < totalLinhas; i++) {
    const op = operacoes[i] || '';
    const transacao = op.split(':')[0];
    const texto = i <= passoAtual ? interpretarOperacao(op) : '';
    const cores = coresTransacoes[transacao] || {
      texto: 'black',
      fundo: '#f5f5f5',
      borda: '#ccc'
    };
    const status = estadoOperacoes[i]; // "esperando" | "executado" | undefined

    const linha = transacoes.map((t, index) => {
      if (t === transacao && texto) {
        const direcao = index < transacoes.length / 2 ? 'slide-from-left' : 'slide-from-right';

        // Se a operação está em espera → mostra mensagem no lugar do bloco
        if (status === "esperando") {
          return (
            <WaitMessage
              key={`${i}-${t}`}
              texto={mensagensEspera[i] || `${transacao} aguardando...`}
              operacaoOriginal={texto}
              index={i}
              cor={cores}
              pulsando={errors?.[i] === true}
            />
          );
        }

        if (status === "executado" || !status) {
          return (
            <Bloco
              key={`${i}-${t}`}
              index={i}
              texto={texto}
              cor={cores}
              animacao={direcao}
              pulsando={errors?.[i] === true}
            />
          );
        }
      }
      return <div key={`${i}-${t}`}></div>;
    });

    linhas.push(
      <div className="linha-container" key={i}>
        <div className="numero-linha">{i + 1}.</div>
        <div className="linha-operacao">{linha}</div>
      </div>
    );
  }

  return (
    <div className="janela-tabela">
      <BarraSuperior />
      <div className="conteudo-tabela">
        <div className="execucao-tabela">
          <div className="header-linha">
            {transacoes.map(t => (
              <div
                key={t}
                style={{ flex: 1, color: coresTransacoes[t]?.texto, textAlign: 'center' }}
              >
                {t}
              </div>
            ))}
          </div>
          {linhas}
        </div>
      </div>
    </div>
  );
}

export default Table;
