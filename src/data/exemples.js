
export const exemplos = [
  {
    nome: "Deadlock simples (T1 e T2 em ciclo)",
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: [],
    operacoes: [
      "T1:WL:X",
      "T2:WL:Y",
      "T2:WL:X",
      "T1:WL:Y",
      "T2:U:X",
      "T2:U:Y",
      "T2:Commit",
      "T1:U:X",
      "T1:U:Y",
      "T1:Commit"
    ],
    expressoes: {},
    erro: null
  },

  {
    nome: "Deadlock com três transações",
    numTransacoes: 3,
    numVariaveis: 2,
    valoresVariaveis: [],
    operacoes: [
      "T1:WL:X",
      "T2:WL:Y",
      "T2:WL:X",
      "T1:WL:Y",
      "T3:WL:X",
      "T3:WL:Y",
      "T2:U:X",
      "T2:U:Y",
      "T2:Commit",
      "T1:U:X",
      "T1:U:Y",
      "T1:Commit",
      "T3:U:X",
      "T3:U:Y",
      "T3:Commit"
    ],
    expressoes: {},
    erro: null
  },

  {
    nome: "Deadlock com RL e WL",
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: [],
    operacoes: [
      "T1:WL:X",
      "T2:RL:X",
      "T2:WL:Y",
      "T1:WL:Y",
      "T1:U:X",
      "T1:U:Y",
      "T1:Commit",
      "T2:U:X",
      "T2:U:Y",
      "T2:Commit"
    ],
    expressoes: {},
    erro: null
  },

  {
    nome: "Execução sem erros (2 transações)",
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
    nome: "Execução com 3 transações e expressões",
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
    nome: "Escrita em Y e leitura em X",
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
    nome: "Escrita em X e Y com valores iniciais",
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
    nome: "Três transações com múltiplas operações",
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

  {
    nome: "Espera simples (T2 aguarda X de T1)",
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

  {
    nome: "Múltiplos leitores após liberação",
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

  {
    nome: "Upgrade de RL para WL",
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


  {
    nome: "Conflito em Y com WL bloqueando múltiplas transações",
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


  {
    nome: "Operação sem lock explícito (forma curta) e espera por X",
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

  {
    nome: "Várias esperas encadeadas (fila em X)",
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

  {
    nome: "Commit que libera múltiplos RLs e concede em lote",
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

  {
    nome: "Caso com mistura de R e W sem bloqueios explícitos (testa normalização)",
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: null,
    operacoes: [
      "T1:R:X", "T1:X",
      "T2:X",
      "T1:U:X", "T1:Commit",
      "T2:W:X", "T2:U:X", "T2:Commit"
    ],
    expressoes: { 1: "X+7", 2: "X-3" },
    erro: null
  },

];
