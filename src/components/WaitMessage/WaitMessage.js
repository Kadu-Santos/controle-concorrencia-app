import "./WaitMessage.css";
import Bloco from "../Bloco/Bloco";

function WaitMessage({ texto, operacaoOriginal, index, cor, pulsando}) {
  return (
    <div className="wait-message">
      <p className="message">⏳ {texto}</p>
      <Bloco
        index={index}
        texto={operacaoOriginal}
        cor={cor}
        pulsando={pulsando}
      />
    </div>
  );
}

export default WaitMessage;
