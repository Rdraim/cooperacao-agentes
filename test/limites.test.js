import {test} from 'node:test';import assert from 'node:assert/strict';import {analisarPassagem,ESTADOS} from '../src/passagem.js';
test('prefixos e campos sem dois pontos não viram evidência',()=>{const r=analisarPassagem('# T\nReferencias falsas: ok\nEstado concluido\nObjetivo e autorizacao extra: ok');assert.deepEqual(r.campos,{});assert.equal(r.estado,null);assert.throws(()=>ESTADOS.push('inventado'),TypeError);});

test('contradictory duplicate fields are reported',()=>{assert.deepEqual(analisarPassagem('# T\nEstado: concluido\nEstado: bloqueado').duplicados,['Estado']);});
