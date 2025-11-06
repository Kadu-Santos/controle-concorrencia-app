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
    numVariaveis: 2,
    valoresVariaveis: ["5", "15"],
    operacoes: [
      "T1:RL:X", "T1:R:X",
      "T2:WL:Y", "T2:R:Y", "T2:Y",
      "T1:X",
      "T2:W:Y",
      "T1:U:X", "T1:Commit",
      "T2:U:Y", "T2:Commit"
    ],
    expressoes: { 5: "X+7", 4: "Y*2" },
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
    expressoes: { 4: "Y*53", 7: "X+X", 8: "X/4" },
    erro: null
  },

  // Exemplo A: espera simples (T2 aguarda X de T1)
  {
    numTransacoes: 2,
    numVariaveis: 1,
    valoresVariaveis: ["50"],
    operacoes: [
      "T1:WL:X", "T1:R:X", "T1:X",
      "T2:RL:X", "T2:R:X",
      "T1:W:X",
      "T1:U:X", "T1:Commit",
      "T2:X", "T2:U:X", "T2:Commit"
    ],
    expressoes: { 2: "X-20", 8: "X*3" },
    erro: null
  },

  // Exemplo B: múltiplos leitores (T2 e T3 lêem X após T1 liberar)
  {
    numTransacoes: 3,
    numVariaveis: 1,
    valoresVariaveis: ["100"],
    operacoes: [
      "T1:WL:X", "T1:R:X", "T1:X",
      "T2:RL:X", "T2:R:X",
      "T3:RL:X", "T3:R:X",
      "T1:U:X", "T1:Commit",
      "T2:U:X", "T2:Commit",
      "T3:U:X", "T3:Commit"
    ],
    expressoes: { 2: "X-10", 5: "X+5", 8: "X*2" },
    erro: null
  },

  // Exemplo C: upgrade de RL para WL (T1 faz upgrade)
  {
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: ["8", "20"],
    operacoes: [
      "T1:RL:X", "T1:R:X",
      "T2:RL:X", "T2:R:X",
      "T1:WL:X", "T1:X",
      "T1:W:X",
      "T1:U:X", "T1:Commit",
      "T2:U:X", "T2:Commit"
    ],
    expressoes: { 2: "X+2", 5: "X-1", 6: "X*5" },
    erro: null
  },

  // Exemplo D: conflito em Y com WL bloqueando múltiplas transações
  {
    numTransacoes: 4,
    numVariaveis: 1,
    valoresVariaveis: ["60"],
    operacoes: [
      "T1:WL:X", "T1:R:X", "T1:X",
      "T2:RL:X", "T2:R:X",
      "T3:RL:X", "T3:R:X",
      "T1:W:X",
      "T1:U:X", "T1:Commit",
      "T2:X", "T2:U:X", "T2:Commit",
      "T3:X", "T3:U:X", "T3:Commit"
    ],
    expressoes: { 2: "X-10", 10: "X+1", 13: "X*2" },
    erro: null
  },

  // Exemplo E: operação sem lock explícito (forma curta) e espera por X
  {
    numTransacoes: 3,
    numVariaveis: 2,
    valoresVariaveis: ["12", "18"],
    operacoes: [
      "T1:WL:X", "T1:R:X", "T1:X",
      "T2:RL:Y", "T2:R:Y",
      "T3:X", "T3:R:X",
      "T1:W:X",
      "T1:U:X", "T1:Commit",
      "T3:U:X", "T3:Commit",
      "T2:U:Y", "T2:Commit"
    ],
    expressoes: { 2: "X+4", 5: "X-1", 7: "X*3" },
    erro: null
  },

  // Exemplo F: várias esperas encadeadas (fila em X)
  {
    numTransacoes: 4,
    numVariaveis: 1,
    valoresVariaveis: ["5"],
    operacoes: [
      "T1:WL:X", "T1:R:X", "T1:X",
      "T2:RL:X", "T2:R:X",
      "T3:RL:X", "T3:R:X",
      "T4:RL:X", "T4:R:X",
      "T1:W:X",
      "T1:U:X", "T1:Commit",
      "T2:U:X", "T2:Commit",
      "T3:U:X", "T3:Commit",
      "T4:U:X", "T4:Commit"
    ],
    expressoes: { 2: "X+1", 5: "X+2", 8: "X-3", 10: "X*2" },
    erro: null
  },

  // Exemplo G: commit que libera múltiplos RLs e concede em lote
  {
    numTransacoes: 3,
    numVariaveis: 1,
    valoresVariaveis: ["3"],
    operacoes: [
      "T1:WL:X", "T1:R:X", "T1:X",
      "T2:RL:X", "T2:R:X",
      "T3:RL:X","T1:W:X" , "T3:R:X",
      "T1:U:X", // libera e deve conceder T2 e T3 RLs
      "T1:Commit",
      "T2:X", "T2:U:X", "T2:Commit",
      "T3:X", "T3:U:X", "T3:Commit"
    ],
    expressoes: { 2: "X+6", 10: "X-1", 13: "X*4" },
    erro: null
  },


  // Exemplo J: caso com mistura de R e W sem bloqueios explícitos (testa normalização)
  {
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: null,
    operacoes: [
      "T1:R:X", "T1:X",
      "T2:X", // forma curta que deverá ser normalizada para W
      "T1:U:X", "T1:Commit",
      "T2:W:X", "T2:U:X", "T2:Commit"
    ],
    expressoes: { 1: "X+7", 2: "X-3" },
    erro: null
  },

];
