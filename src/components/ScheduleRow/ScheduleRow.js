import { useState, useRef } from "react";
import MultiLevelDropdown from "../MultiLevelDropdown/MultiLevelDropdown";
import DropdownControlButtons from "../DropdownControlButtons/DropdownControlButtons";
import Operation from "../Operation/Operation";
import "./SchedulerRow.css";
import { isOperacaoMatematica } from "../../utils/Valid";

export default function ScheduleRow({
  opStr, expressao,
  numTransacoes, numVariaveis, disable,
  onChangeOpStr, onChangeExpressao,
  onAddAfter, onRemove,
  isLast, canRemove,
}) {

  const [showControls, setShowControls] = useState(false);
  const hoverTimerRef = useRef(null);
  const controlsRef = useRef(null);


  const handleMouseEnter = () => {
    if (isLast || disable) return;

    hoverTimerRef.current = setTimeout(() => {
      setShowControls(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (!isLast) setShowControls(false);
  };

  const handleRowMouseDown = (e) => {
    if (!showControls) return;

    if (controlsRef.current && controlsRef.current.contains(e.target)) {
      return;
    }

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
        disabled={disable}
      />

      {isOp && (
        <>
          <Operation
            numVariaveis={numVariaveis}
            onOperacaoChange={onChangeExpressao}
            valorInicial={expressao}
            disabled={disable}
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
            podeAdicionar={!!opStr?.trim() && !disable}
            podeRemover={canRemove && !disable}
          />
        </div>
      )}
    </div>
  );
}
