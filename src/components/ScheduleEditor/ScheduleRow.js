import { useState, useRef } from "react";
import MultiLevelDropdown from "../MultiLevelDropdown/MultiLevelDropdown";
import DropdownControlButtons from "../DropdownControlButtons/DropdownControlButtons";
import Operation from "../Operation/Operation";
import "./SchedulerRow.css";
import { isOperacaoMatematica } from "../../utils/Valid";

export default function ScheduleRow({
  id, index,
  opStr, expressao,
  numTransacoes, numVariaveis, executando,
  valor, valoresVariaveis,
  onChangeOpStr, onChangeExpressao,
  onAddAfter, onRemove,
  isLast
}) {

  const [showControls, setShowControls] = useState(false);
  const hoverTimerRef = useRef(null);
  const controlsRef = useRef(null);


  const handleMouseEnter = () => {
    // último item não usa hover (mantém padrão atual)
    if (isLast || executando) return;

    hoverTimerRef.current = setTimeout(() => {
      setShowControls(true);
    }, 500); // 1 segundo parado
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (!isLast) setShowControls(false);
  };

  const handleRowMouseDown = (e) => {
    // se os controles não estão visíveis, nada a fazer
    if (!showControls) return;

    // se clicou nos botões → não esconda
    if (controlsRef.current && controlsRef.current.contains(e.target)) {
      return;
    }

    // se clicou em qualquer outra área dentro do row → esconda
    setShowControls(false);
  };


  // checar se é operação matematica
  const isOp = isOperacaoMatematica(opStr, numVariaveis);

  return (
    <div
      className="schedule-row"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleRowMouseDown}
    >
      <MultiLevelDropdown
        transactionCount={numTransacoes}
        variableCount={numVariaveis}
        onSelect={onChangeOpStr}
        selectedValue={opStr}
        disabled={executando}
      />

      {isOp && (
        <>
          <Operation
            numVariaveis={numVariaveis}
            onOperacaoChange={onChangeExpressao}
            valorInicial={expressao}
            disabled={executando}
          />
          <span className="pontoVirgulaOp">;</span>
        </>
      )}

      {!isOp && <span className="pontoVirgulaIns">;</span>}

      {/* BOTÕES DE CONTROLE */}
      {(isLast || showControls) && (
        <div ref={controlsRef}>
          <DropdownControlButtons
            onAdd={onAddAfter}
            onRemove={onRemove}
            podeAdicionar={!!opStr?.trim()}
            podeRemover={true}
          />
        </div>
      )}
    </div>
  );
}
