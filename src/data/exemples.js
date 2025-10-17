// src/data/exemplos.js

export const exemplos = [
  // Exemplo 1: Sem erros
  {
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: ["10", "20"],
    operacoes: [
      "T1:RL:X", "T1:R:X", "T1:X",
      "T2:WL:Y", "T2:R:Y",
      "T1:U:X",
      "T2:Y", "T2:W:Y",
      "T1:Commit",
      "T2:U:Y", "T2:Commit"
    ],
    expressoes: { 2: "X+5", 6: "Y*2" },
    erro: null
  },

  {
    numTransacoes: 3,
    numVariaveis: 2,
    valoresVariaveis: ["30", "40"],
    operacoes: [
      "T1:WL:X", "T1:R:X", "T1:X",
      "T2:RL:Y",
      "T3:RL:X", "T3:R:X",
      "T1:W:X",
      "T2:R:Y", "T2:Y",
      "T3:X",
      "T1:U:X", "T1:Commit",
      "T2:U:Y", "T2:Commit",
      "T3:U:X", "T3:Commit"
    ],
    expressoes: { 2: "X-5", 8: "Y+10", 9: "X*2" },
    erro: null
  },

  {
    numTransacoes: 2,
    numVariaveis: 3,
    valoresVariaveis: ["5", "15", "25"],
    operacoes: [
      "T1:RL:X", "T1:R:X",
      "T2:WL:Y", "T2:R:Y", "T2:Y",
      "T1:X",
      "T2:W:Y",
      "T1:U:X", "T1:Commit",
      "T2:U:Y", "T2:Commit"
    ],
    expressoes: { 4: "X+Y", 5: "Y+Z" },
    erro: null
  },


  {
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: ["100", "200"],
    operacoes: [
      "T1:WL:X", "T1:R:X", "T1:X",
      "T2:RL:Y", "T2:R:Y",
      "T1:W:X",
      "T2:Y",
      "T1:U:X",
      "T2:U:Y",
      "T1:Commit", "T2:Commit"
    ],
    expressoes: { 2: "X+10", 6: "Y-50" },
    erro: null
  },

  {
    numTransacoes: 3,
    numVariaveis: 2,
    valoresVariaveis: ["7", "14"],
    operacoes: [
      "T1:RL:X", "T1:R:X",
      "T2:WL:Y", "T2:R:Y", "T2:Y",
      "T3:RL:X", "T3:R:X", "T3:X",
      "T1:X",
      "T2:W:Y",
      "T1:U:X", "T1:Commit",
      "T2:U:Y", "T2:Commit",
      "T3:U:X", "T3:Commit"
    ],
    expressoes: { 4: "X*X", 7: "Y+X", 8: "X+Y" },
    erro: null
  },

];
