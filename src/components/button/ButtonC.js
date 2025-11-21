import React from "react";
import "./ButtonC.css";

const ButtonC = ({ texto, corTexto, corFundo, onClick, ativo = true, fontSize = "20px", width = "200px", height = "" }) => {
  const estilo = {
    color: ativo ? corTexto : "#888",
    backgroundColor: ativo ? corFundo : "#ccc",
    cursor: ativo ? "pointer" : "not-allowed",
    fontSize: fontSize,
    width,
    height
  };

  return (
    <button
      className="botao"
      style={estilo}
      onClick={ativo ? onClick : undefined}
      disabled={!ativo}
    >
      {texto}
    </button>
  );
};

export default ButtonC;
