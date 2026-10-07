import { validarPassagem, MODELO } from '../src/passagem.js';

// Uma passagem sintética de exemplo.
const passagem = `# Corrige detecção de separador

Data e agente: 2026-02-01, agente B
Estado: em andamento
Objetivo e autorizacao: tratar arquivos com tabulação, pedido do mantenedor
Arquivos/areas em trabalho: src/index.js
Mudancas realizadas e motivo: conta tab fora das aspas na primeira linha
Alteracoes fora do versionamento (banco, config, conteudo): nenhuma
Verificacoes e resultados: node --test local, verde
Nao verificado / limites: nao testei UTF-16
Estado do servico / publicacao: nao publicado
Proximo passo concreto: abrir PR e pedir revisao do agente A
Referencias: issue #12
`;

console.log('válida?', validarPassagem(passagem));
console.log('\n--- o modelo em branco (gabarito) ---');
console.log('válido?', validarPassagem(MODELO).ok, '(esperado: false)');
