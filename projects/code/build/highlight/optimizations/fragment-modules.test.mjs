// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { compileLanguages, emitMachines } from '../generate.mjs';
import { fragmentModules } from './fragment-modules.mjs';
import { createScanner } from '../../../src/internal/highlight/scanner.mjs';
import { machineCases } from '../../../tests/highlight/fixtures/machine-corpus.mjs';

async function withModules(files, run) {
  const directory = await mkdtemp(join(tmpdir(), 'elements-shared-fragments-'));
  try {
    await Promise.all([...files].map(([name, source]) => writeFile(join(directory, name), source)));
    return await run(name => import(pathToFileURL(join(directory, name)).href));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

for (const nativeCase of [false, true]) {
  const compiled = await compileLanguages(nativeCase);
  for (const pooled of [false, true])
    test(`whole alternatives preserve ${nativeCase ? 'native' : 'portable'} ${pooled ? 'pooled' : 'independent'} captures`, async () => {
      const entries = compiled;
      const original = emitMachines(entries, pooled);
      const files = fragmentModules(original, 128, 256, { branches: true });
      assert.deepEqual(fragmentModules(original, 128, 256, { branches: true }), files);
      await withModules(files, async load => {
        for (const { language, machine } of entries) {
          const generated = (await load(`${language}.mjs`)).default;
          assert.deepEqual(generated, machine, language);
          const scan = createScanner(generated);
          const baseline = createScanner(compiled.find(entry => entry.language === language).machine);
          for (const sample of machineCases.filter(sample => sample.language === language))
            assert.deepEqual(scan(sample.text), baseline(sample.text), sample.name);
        }
      });
    });
}

test('whole alternatives share unwrapped branches while preserving class bars, escapes and ownership', async () => {
  const shared = `()${'a'.repeat(200)}[|]\\|(z)\\2`;
  const originals = [`${shared}|()first`, `${shared}|()second`];
  const input = new Map(
    originals.map((source, index) => [`source-${index}.mjs`, `export default ${JSON.stringify(source)};`])
  );
  assert.equal(fragmentModules(input).size, 2);
  const files = fragmentModules(input, 128, 256, { branches: true });
  assert.equal(files.size, 3);
  assert.ok(files.has('fragments-3.mjs'));
  await withModules(files, async load => {
    for (const [index, expected] of originals.entries()) {
      const actual = (await load(`source-${index}.mjs`)).default;
      assert.equal(actual, expected);
      assert.equal(new RegExp(actual).test(`${'a'.repeat(200)}||zz`), true);
    }
  });
});

for (const nativeCase of [false, true]) {
  const compiled = await compileLanguages(nativeCase);
  for (const pooled of [false, true])
    test(`shared fragments preserve every ${nativeCase ? 'native' : 'portable'} ${pooled ? 'pooled' : 'independent'} machine and corpus`, async () => {
      const original = emitMachines(compiled, pooled);
      const before = [...original];
      const files = fragmentModules(original);
      assert.deepEqual([...original], before);
      assert.deepEqual(fragmentModules(original), files);
      await withModules(files, async load => {
        for (const { language, machine } of compiled) {
          const generated = (await load(`${language}.mjs`)).default;
          // Exact capture indexes, flags, dynamic ends, rules and strings matter;
          // matching only this corpus would miss changes in unused states.
          assert.deepEqual(generated, machine, language);
          const baseline = createScanner(machine);
          const scan = createScanner(generated);
          for (const sample of machineCases.filter(sample => sample.language === language))
            assert.deepEqual(scan(sample.text), baseline(sample.text), sample.name);
        }
      });
    });
}

test('shared fragments preserve escapes and Unicode with exact ownership beyond 32 modules', async () => {
  const shared = `(?:${'(?:(a)\\1[\\\\()]|😀|"|\n)'.repeat(8)})`;
  const originals = Array.from({ length: 34 }, (_, owner) => ({
    source: owner === 0 || owner === 33 ? shared : `(unique-${owner})`
  }));
  const input = new Map(
    originals.map((value, owner) => [`owner-${owner}.mjs`, `export default ${JSON.stringify(value)};\n`])
  );
  const files = fragmentModules(input);
  const common = 'fragments-200000001.mjs';
  assert.ok(files.has(common));
  assert.ok(files.get('owner-0.mjs').includes(common));
  assert.ok(files.get('owner-33.mjs').includes(common));
  assert.ok(!files.get('owner-1.mjs').includes(common));
  assert.equal(files.size, input.size + 1);
  await withModules(files, async load => {
    for (const [owner, value] of originals.entries())
      assert.deepEqual((await load(`owner-${owner}.mjs`)).default, value);
  });
  assert.deepEqual(fragmentModules(new Map()), new Map());
});
