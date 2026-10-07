import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analisarPassagem, validarPassagem, MODELO, ESTADOS, CAMPOS } from '../src/passagem.js';

const COMPLETA = `# Ajuste no leitor de CSV

Data e agente: 2026-01-10, agente A
Estado: concluido
Objetivo e autorizacao: tratar separador por tab, pedido do mantenedor
Arquivos/areas em trabalho: src/index.js, test/csv.test.js
Mudancas realizadas e motivo: detecta tab quando supera a virgula
Alteracoes fora do versionamento (banco, config, conteudo): nenhuma
Verificacoes e resultados: node --test, 10/10 ok
Nao verificado / limites: arquivos acima de 20 MB nao testados
Estado do servico / publicacao: nao aplicavel
Proximo passo concreto: revisar deteccao de aspas no cabecalho
Referencias: commit abc1234
`;

test('uma passagem completa é válida', () => {
  const r = validarPassagem(COMPLETA);
  assert.equal(r.ok, true);
  assert.deepEqual(r.faltando, []);
  assert.deepEqual(r.avisos, []);
  assert.equal(r.estado, 'concluido');
  assert.equal(r.titulo, 'Ajuste no leitor de CSV');
});

test('analisarPassagem extrai título, campos e estado', () => {
  const { titulo, campos, estado } = analisarPassagem(COMPLETA);
  assert.equal(titulo, 'Ajuste no leitor de CSV');
  assert.equal(estado, 'concluido');
  assert.equal(campos['Proximo passo concreto'], 'revisar deteccao de aspas no cabecalho');
});

test('lista os campos que faltam', () => {
  const minima = '# Só o começo\n\nEstado: em andamento\n';
  const r = validarPassagem(minima);
  assert.equal(r.ok, false);
  assert.ok(r.faltando.includes('Proximo passo concreto'));
  assert.ok(r.faltando.includes('Objetivo e autorizacao'));
  assert.ok(!r.faltando.includes('Estado'));
});

test('estado não reconhecido vira aviso', () => {
  const texto = COMPLETA.replace('Estado: concluido', 'Estado: voando');
  const r = validarPassagem(texto);
  assert.equal(r.estado, null);
  assert.equal(r.ok, false);
  assert.equal(r.avisos.length, 1);
  assert.match(r.avisos[0], /não reconhecido/);
});

test('o MODELO em branco não passa (é gabarito, não registro)', () => {
  const r = validarPassagem(MODELO);
  assert.equal(r.ok, false);
});

test('todos os estados do menu são reconhecidos', () => {
  for (const e of ESTADOS) {
    const texto = COMPLETA.replace('Estado: concluido', `Estado: ${e}`);
    assert.equal(validarPassagem(texto).estado, e);
  }
  assert.equal(CAMPOS.length, 11);
});
