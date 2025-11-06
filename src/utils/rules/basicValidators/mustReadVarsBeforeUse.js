/**
 * Regra: Verifica se variáveis usadas em expressões já foram lidas pela transação
 *
 * Para cada transação, mantém um histórico das variáveis lidas (via R ou RL).
 * Quando encontra uma expressão Tn:VAR=EXPR, garante que todas as variáveis
 * no lado direito já estejam no histórico.
 * Exceção: se a variável usada for a mesma que está sendo atribuída (ex: X=X*2).
 */
export default function mustReadVarsBeforeUse(instructions = []) {
  const violations = [];
  const historicoLeituras = {}; // { T1: Set(['X','Y']), T2: Set([...]) }

  instructions.forEach((instrucao, index) => {
    if (typeof instrucao !== 'string') return;

    const partes = instrucao.split(':').map(p => p.trim());
    if (partes.length < 2) return;

    const transacao = partes[0]; // T1, T2...
    const op = partes[1];
    historicoLeituras[transacao] ||= new Set();

    // Leitura explícita: Tn:R:VAR ou Tn:RL:VAR
    if (partes.length >= 3) {
      const tipo = partes[1].toUpperCase();
      const item = partes.slice(2).join(':').trim(); // suporta ":" no item, se houver
      if ((tipo === 'R' || tipo === 'RL') && item) {
        historicoLeituras[transacao].add(item.toUpperCase());
      }
    }

    // Expressão inline: Tn:VAR=EXPR (op contém '=')
    if (op.includes('=')) {
      const [variavelEsquerda, expr] = op.split('=');
      const variavelAlvo = (variavelEsquerda || '').trim().toUpperCase();

      // Extrai variáveis X/Y/Z/W do lado direito
      const variaveisUsadas = Array.from(
        new Set(((expr || '').match(/[A-Za-z_][A-Za-z0-9_]*/g) || [])
          .map(t => t.trim().toUpperCase()))
      ).filter(v => ['X','Y','Z','W'].includes(v));

      // Ignora a própria variável alvo; ex.: X=X*2 não precisa de leitura de X
      const variaveisCriticas = variaveisUsadas.filter(v => v !== variavelAlvo);

      // Verifica variáveis não lidas previamente pela mesma transação
      const naoLidas = variaveisCriticas.filter(v => !historicoLeituras[transacao].has(v));

      if (naoLidas.length > 0) {
        violations.push({
          name: `Transação ${transacao} usou ${naoLidas.join(', ')} sem leitura prévia (linha ${index + 1})`,
          indices: [index]
        });
      }
    }
  });

  return violations;
}
