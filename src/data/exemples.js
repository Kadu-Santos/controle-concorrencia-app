// src/data/exemplos.js

export const exemplos = [
  {
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: ["10", "20"],
    operacoes: ["T1:RL:X", "T1:X", "T1:U:X", "T1:Commit", "T2:WL:Y", "T2:Y", "T2:U:Y", "T2:Commit"],
    expressoes: { 1: "X+5", 5: "Y*2" },
    erro: null 
  },
  {
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: ["10", "15"],
    operacoes: ["T1:WL:X", "T2:WL:Y", "T1:RL:Y", "T2:RL:X"],
    expressoes: { 0: "Y+X", 3: "X+Y" }, 
    erro: "Deadlock detectado entre T1 e T2"
  },
  {
    numTransacoes: 3,
    numVariaveis: 2,
    valoresVariaveis: ["5", "25"],
    operacoes: ["T1:RL:X", "T2:WL:X", "T1:U:X", "T2:X", "T2:U:X", "T2:Commit", "T1:Commit"],
    expressoes: { 3: "X-5" }, 
    erro: "Leitura suja — T1 leu valor não confirmado de T2"
  },
  {
    numTransacoes: 2,
    numVariaveis: 1,
    valoresVariaveis: ["50"],
    operacoes: ["T1:WL:X", "T1:X", "T1:U:X", "T2:WL:X", "T2:X", "T1:Commit", "T2:Commit"],
    expressoes: { 1: "X-10", 4: "X+20" }, 
    erro: "Atualização perdida — T1 e T2 sobrescreveram o mesmo item X"
  },
  {
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: ["10", "20"],
    operacoes: ["T1:WL:X", "T1:X", "T1:U:X", "T1:WL:Y", "T1:Y", "T1:Commit"],
    expressoes: { 1: "X+Y", 4: "X+Y" }, 
    erro: "Violação do protocolo 2PL — desbloqueio antes de obter todos os locks"
  },
  {
    numTransacoes: 3,
    numVariaveis: 2,
    valoresVariaveis: ["30", "40"],
    operacoes: ["T1:RL:X", "T1:X", "T2:WL:X", "T3:RL:Y", "T2:X", "T1:U:X", "T2:Commit", "T3:Commit"],
    expressoes: { 1: "X+10", 4: "X*2" }, 
    erro: "Leitura não repetitiva — T1 leu X antes e depois da atualização de T2"
  },
  {
    numTransacoes: 1,
    numVariaveis: 1,
    valoresVariaveis: ["10"],
    operacoes: ["T1:WL:X", "T1:R:X", "T1:X", "T1:W:X", "T1:U:X"],
    expressoes: { 2: "X+5" },
    erro: "Transação T1 não finalizou com commit ou abort"
  },
  {
    numTransacoes: 3,
    numVariaveis: 3,
    valoresVariaveis: ["5", "10", "20"],
    operacoes: [
      "T1:WL:X", "T1:X", "T2:RL:X", "T3:WL:Y", "T2:X", "T3:Y", "T1:U:X", "T3:U:Y", "T1:Commit", "T2:Commit", "T3:Commit"
    ],
    expressoes: { 1: "X+2", 4: "X*3", 5: "Y+X" }, 
    erro: "Condição de corrida — T2 leu valor de X antes da confirmação de T1"
  },
  {
    numTransacoes: 2,
    numVariaveis: 2,
    valoresVariaveis: ["12", "8"],
    operacoes: ["T1:WL:X", "T2:WL:Y", "T1:U:X", "T1:WL:Y", "T2:U:Y", "T2:WL:X"],
    expressoes: { 5: "X*Y" }, 
    erro: "Deadlock potencial — espera circular detectada"
  },
  {
    numTransacoes: 2,
    numVariaveis: 1,
    valoresVariaveis: ["100"],
    operacoes: ["T1:RL:X", "T2:WL:X", "T1:X", "T2:X", "T1:Commit", "T2:Commit"],
    expressoes: { 2: "X/2", 3: "X-10" }, 
    erro: "Leitura suja — T1 leu valor inconsistente de X"
  }
];
