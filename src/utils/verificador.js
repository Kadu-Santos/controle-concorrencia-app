import unlockStart from './regras/unlockStart';
import commitStart from './regras/commitStart';

const regras = [unlockStart, commitStart];

export default function verificador(instrucoes = []) {
  const erros = [];

  for (const regra of regras) {
    const resultado = regra(instrucoes);
    if (resultado?.indices?.length) {
      erros.push(resultado);
    }
  }

  const indicesSet = new Set(erros.flatMap(e => e.indices));
  const indicesComErro = Array.from({ length: instrucoes.length }, (_, i) =>
    indicesSet.has(i)
  );

  return { erros, indicesComErro };
}
