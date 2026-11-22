import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { LAB_EXPERIMENTS, LAB_FILTERS } from '../src/content/lab.ts';
import { JP } from '../src/content/jp.ts';

test('experimentos do lab têm ids únicos, capas reais e categorias válidas', () => {
  const ids = new Set<string>();
  const validTags = new Set(LAB_FILTERS.filter((f) => f.id !== 'all').map((f) => f.id));
  for (const exp of LAB_EXPERIMENTS) {
    assert.ok(!ids.has(exp.id), `id duplicado: ${exp.id}`);
    ids.add(exp.id);
    assert.ok(validTags.has(exp.tag), `${exp.id}: tag inválida`);
    assert.ok(exp.tools.length >= 2, `${exp.id}: tools`);
    assert.ok(existsSync('public' + exp.cover), `${exp.id}: capa ausente ${exp.cover}`);
    assert.ok(exp.jpKey in JP, `${exp.id}: jpKey inválido`);
  }
});

test('nenhum preço nos textos do lab', () => {
  const json = JSON.stringify(LAB_EXPERIMENTS);
  assert.doesNotMatch(json, /R\$\s?\d|US\$\s?\d|\$\d/);
});
