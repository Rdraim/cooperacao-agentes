/* ============================================================================
   cooperacao-agentes — modelo e validador de "passagem" (handoff) entre agentes
   que colaboram pelo mesmo repositório Git.

   A ideia: o repositório é a memória comum. Cada tarefa deixa um registro curto
   (a "passagem") com objetivo, estado, arquivos em trabalho, o que mudou, o que
   não foi verificado e o próximo passo. Quem retoma lê o registro e confirma o
   estado real antes de editar. Isto não é um orquestrador autônomo — é um
   protocolo de disciplina, revisável por humanos e por outros agentes.

   Este módulo é a parte executável: valida que uma passagem tem as seções
   mínimas e um estado reconhecido. Lógica pura, sem dependências.
   ============================================================================ */

/** Estados reconhecidos de uma tarefa. */
export const ESTADOS = Object.freeze(['em andamento', 'concluido', 'interrompido', 'bloqueado']);

/** Seções mínimas de uma passagem (o rótulo que inicia a linha). */
export const CAMPOS = Object.freeze([
  'Data e agente',
  'Estado',
  'Objetivo e autorizacao',
  'Arquivos/areas em trabalho',
  'Mudancas realizadas e motivo',
  'Alteracoes fora do versionamento',
  'Verificacoes e resultados',
  'Nao verificado / limites',
  'Estado do servico / publicacao',
  'Proximo passo concreto',
  'Referencias',
]);

/** Modelo pronto para copiar. */
export const MODELO = `# Assunto da tarefa

Data e agente:
Estado: em andamento | concluido | interrompido | bloqueado
Objetivo e autorizacao:
Arquivos/areas em trabalho:
Mudancas realizadas e motivo:
Alteracoes fora do versionamento (banco, config, conteudo):
Verificacoes e resultados:
Nao verificado / limites:
Estado do servico / publicacao:
Proximo passo concreto:
Referencias:
`;

const semAcento = (s) => String(s ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().trim();

/** Lê uma passagem em texto e devolve título, campos preenchidos e estado. */
export function analisarPassagem(texto) {
  const linhas = String(texto || '').split(/\r?\n/);
  const titulo = (linhas.find((l) => l.trim().startsWith('#')) || '').replace(/^#+\s*/, '').trim();

  const campos = {};
  const duplicados = [];
  for (const rotulo of CAMPOS) {
    const alvo = semAcento(rotulo);
    const correspondencias = linhas.filter((l) => {
      const pos = l.indexOf(':');
      if (pos < 0) return false;
      const chave = semAcento(l.slice(0, pos)).replace(/\s*\([^)]*\)$/, '');
      return chave === alvo;
    });
    if (correspondencias.length > 1) duplicados.push(rotulo);
    const linha = correspondencias[0];
    if (linha) {
      const valor = linha.slice(linha.indexOf(':') + 1).trim();
      campos[rotulo] = valor;
    }
  }

  const estadoBruto = semAcento(campos['Estado'] || '');
  const estado = ESTADOS.find((e) => estadoBruto === e) || null;
  return { titulo, campos, estado, duplicados };
}

/**
 * Valida uma passagem.
 * @returns {{ ok: boolean, titulo: string, estado: string|null, faltando: string[], avisos: string[] }}
 */
export function validarPassagem(texto) {
  const { titulo, campos, estado, duplicados } = analisarPassagem(texto);
  const faltando = [];
  const avisos = duplicados.map(c => 'campo duplicado: ' + c);

  if (!titulo) avisos.push('sem título (linha iniciada por "#")');
  for (const rotulo of CAMPOS) {
    if (rotulo === 'Estado') continue;
    if (!campos[rotulo]) faltando.push(rotulo);
  }
  if (!campos['Estado']) {
    faltando.push('Estado');
  } else if (!estado) {
    avisos.push(`estado não reconhecido: "${campos['Estado']}" (use um de: ${ESTADOS.join(', ')})`);
  }

  return { ok: faltando.length === 0 && avisos.length === 0, titulo, estado, faltando, avisos };
}

export default { ESTADOS, CAMPOS, MODELO, analisarPassagem, validarPassagem };
