// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { after } from 'node:test';
import { emitMachines, generateLanguages, writeGeneration } from './generate.mjs';
import { languages, loadLanguage } from './loaders/load-language.mjs';
import { createScanner } from '../../src/internal/highlight/scanner.mjs';
import { createDocument, editDocument } from '../../src/code-textarea/internal/incremental.mjs';
import { categories } from '../../src/internal/highlight/categories.mjs';
import { machineCases as samples } from '../../tests/highlight/fixtures/machine-corpus.mjs';
import { grammarFingerprint, grammarProvenance } from './provenance/grammar-provenance.mjs';
import { loadGrammar } from './compile.mjs';

const directories = [];
after(async () => {
  await Promise.all(directories.map(directory => rm(directory, { recursive: true, force: true })));
});
const generations = [];
for (const [pooled, nativeCase, fragments, sharedFragments = false] of [
  [false, false, false],
  [true, false, false],
  [false, true, false],
  [true, true, false],
  [false, false, true],
  [true, false, true],
  [false, true, true],
  [true, true, true],
  [false, false, false, true],
  [true, false, false, true],
  [false, true, false, true],
  [true, true, false, true]
]) {
  const generated = await generateLanguages(pooled, nativeCase, fragments, sharedFragments);
  const parent = await mkdtemp(join(tmpdir(), 'elements-generated-'));
  directories.push(parent);
  const directory = join(parent, 'generated');
  await mkdir(directory);
  for (const name of ['scanner.mjs', 'language-registry.mjs'])
    await writeFile(
      join(parent, name),
      await readFile(new URL(`../../src/internal/highlight/${name}`, import.meta.url))
    );
  const url = pathToFileURL(`${directory}/`);
  await writeGeneration(url, generated.files);
  const machines = new Map(
    await Promise.all(
      languages.map(async language => [language, (await import(new URL(`${language}.mjs`, url))).default])
    )
  );
  generations.push({ ...generated, machines, pooled, nativeCase, fragments, sharedFragments, url });
}

test('generates deterministic modules, hashes and provenance without timestamps or filesystem paths', async () => {
  const repeated = await generateLanguages(true);
  assert.deepEqual(repeated, { files: generations[1].files, manifest: generations[1].manifest });
  assert.deepEqual(await generateLanguages(false, false, false, true), {
    files: generations[8].files,
    manifest: generations[8].manifest
  });
  assert.deepEqual(generations[0].manifest.languages, generations[1].manifest.languages);
  assert.equal(generations[1].manifest.sourcePackages[0].name, '@shikijs/langs');
  for (const generated of generations) {
    assert.ok(!generated.files.get('manifest.json').includes(process.cwd()));
    for (const entry of generated.manifest.files)
      assert.equal(createHash('sha256').update(generated.files.get(entry.name)).digest('hex'), entry.sha256);
    for (const entry of generated.manifest.languages)
      assert.equal(
        createHash('sha256')
          .update(JSON.stringify(generated.machines.get(entry.language)))
          .digest('hex'),
        entry.machineSha256
      );
  }
});

test('rejects unknown language names at build time', async () => {
  await assert.rejects(loadLanguage('unknown'), /Unknown language/);
});

test('rejects conflicting fragment layouts', async () => {
  await assert.rejects(generateLanguages(false, false, true, true), /Choose local or shared/);
});

test('allows all capture indices as an explicit comparison layout', async () => {
  const generated = await generateLanguages(false, false, false, false, { allIndices: true });
  assert.equal(generated.manifest.representation, 'compact');
  const directory = await mkdtemp(join(tmpdir(), 'elements-all-indices-'));
  directories.push(directory);
  const url = pathToFileURL(`${directory}/`);
  await writeGeneration(url, generated.files);
  for (const language of languages) {
    const machine = (await import(new URL(`${language}.mjs`, url))).default;
    assert.ok(machine.expressions.every(entry => !(entry[1] & 2)));
    const scan = createScanner(machine);
    const selected = createScanner(generations[0].machines.get(language));
    for (const sample of samples.filter(sample => sample.language === language))
      assert.deepEqual(selected(sample.text), scan(sample.text));
  }
});

test('generated attribution covers exact selected grammar data, vocabulary sources and license texts', async () => {
  for (const generated of generations) {
    const { manifest, files } = generated;
    assert.deepEqual(
      manifest.sources.map(entry => entry.language),
      languages
    );
    assert.equal(manifest.sourceArchive.version, '1.32.3');
    for (const entry of manifest.sources) {
      assert.equal(grammarFingerprint(await loadGrammar(entry.module)), entry.grammarSha256);
      assert.match(entry.source, new RegExp(entry.sourceCommit));
      assert.ok(entry.licenseUrl);
    }
    assert.equal(manifest.sources.find(entry => entry.language === 'yaml').license, 'MIT');
    assert.equal(manifest.sources.find(entry => entry.language === 'toml').license, 'LicenseRef-TextMateBundle');
    assert.deepEqual(
      manifest.buildSources.map(entry => entry.module),
      [
        'highlight.js/lib/core',
        ...['bash', 'go', 'javascript', 'typescript', 'xml'].map(name => `highlight.js/lib/languages/${name}`)
      ]
    );
    for (const entry of manifest.buildSources)
      assert.equal(
        entry.sha256,
        createHash('sha256')
          .update(await readFile(new URL(import.meta.resolve(entry.module))))
          .digest('hex')
      );
    const notice = files.get('GRAMMAR-LICENSES.txt');
    for (const entry of manifest.grammarLicenses) {
      const text = await readFile(new URL(`./provenance/licenses/${entry.file}`, import.meta.url), 'utf8');
      assert.equal(createHash('sha256').update(text).digest('hex'), entry.sha256);
      assert.ok(notice.includes(text.trim()));
    }
    for (const holder of [
      'Microsoft Corporation',
      'Fengying Zhao',
      'FichteFoll',
      'Pine Wu',
      'Anthony Fu',
      'Ivan Sagalaev'
    ])
      assert.ok(notice.includes(holder), holder);
    assert.ok(notice.includes('Permission to copy, use, modify, sell and distribute'));
    assert.ok(!notice.includes(process.cwd()));
  }
});

test('generation rejects stale package, grammar and license attribution pins', async () => {
  const pinned = JSON.parse(await readFile(new URL('./provenance/grammar-sources.json', import.meta.url), 'utf8'));
  await assert.rejects(grammarProvenance({ ...pinned, shikiVersion: '0.0.0' }), /Shiki version changed/);
  const changedGrammar = structuredClone(pinned);
  changedGrammar.sources.find(entry => entry.language === 'python').grammarSha256 = '0'.repeat(64);
  await assert.rejects(grammarProvenance(changedGrammar), /Grammar source changed: python/);
  const changedLicense = structuredClone(pinned);
  changedLicense.licenses[0].sha256 = '0'.repeat(64);
  await assert.rejects(grammarProvenance(changedLicense), /Grammar license changed/);
  const grammar = { scopeName: 'source.example', patterns: [{ match: 'a', name: 'keyword' }] };
  assert.equal(
    grammarFingerprint(grammar),
    grammarFingerprint({
      patterns: grammar.patterns,
      scopeName: grammar.scopeName,
      displayName: 'New label',
      aliases: ['example']
    })
  );
  assert.notEqual(
    grammarFingerprint(grammar),
    grammarFingerprint({ ...grammar, patterns: [{ match: 'b', name: 'keyword' }] })
  );
});

test('shares identical tuples while keeping unrelated expressions out of import closures', () => {
  const compiled = [
    {
      language: 'a',
      machine: {
        states: [],
        rules: [],
        expressions: [
          ['shared', 0],
          ['only-a', 0],
          ['flags', 1]
        ]
      }
    },
    {
      language: 'b',
      machine: {
        states: [],
        rules: [],
        expressions: [
          ['shared', 0],
          ['flags', 0]
        ]
      }
    },
    { language: 'c', machine: { states: [], rules: [], expressions: [['only-c', 0]] } }
  ];
  const files = emitMachines(compiled, true);
  assert.equal(files.size, 4);
  assert.match(files.get('expressions-3.mjs'), /shared/);
  assert.ok(!files.get('expressions-3.mjs').includes('only-'));
  assert.ok(!files.get('c.mjs').includes('import'));
  assert.ok(files.get('a.mjs').includes('["flags",1]'));
  assert.ok(files.get('b.mjs').includes('["flags",0]'));
});

test('pool ownership does not alias language indexes beyond a 32-bit mask', () => {
  const compiled = Array.from({ length: 34 }, (_, index) => ({
    language: `language-${index}`,
    machine: {
      states: [],
      rules: [],
      expressions: index === 0 || index === 33 ? [['shared', 0]] : [[`only-${index}`, 0]]
    }
  }));
  const files = emitMachines(compiled, true);
  assert.ok(files.get('language-0.mjs').includes("from'./expressions-200000001.mjs'"));
  assert.ok(files.get('language-33.mjs').includes("from'./expressions-200000001.mjs'"));
  assert.ok(!files.get('language-1.mjs').includes('import'));
  assert.equal(files.size, 35);
});

test('rebuilding a real pooled output as independent removes obsolete expression modules', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'elements-layout-change-'));
  directories.push(directory);
  const url = pathToFileURL(`${directory}/`);
  await writeGeneration(url, generations[1].files);
  await writeFile(new URL('notes.txt', url), 'preserve');
  assert.ok((await readdir(directory)).some(name => name.startsWith('expressions-')));
  await writeGeneration(url, generations[0].files);
  assert.deepEqual((await readdir(directory)).sort(), [...generations[0].files.keys(), 'notes.txt'].sort());
  for (const [name, source] of generations[0].files) assert.equal(await readFile(new URL(name, url), 'utf8'), source);
  assert.equal(await readFile(new URL('notes.txt', url), 'utf8'), 'preserve');
});

for (const language of languages)
  test(`${language} imports pure machine data and preserves corpus ranges, checkpoints and edits`, () => {
    const machines = generations.map(generated => generated.machines.get(language));
    for (const generated of generations) {
      const reference = generations.find(
        candidate =>
          candidate.nativeCase === generated.nativeCase &&
          !candidate.pooled &&
          !candidate.fragments &&
          !candidate.sharedFragments
      );
      assert.deepEqual(generated.machines.get(language), reference.machines.get(language));
    }
    const scans = machines.map(createScanner);
    for (const sample of samples.filter(sample => sample.language === language)) {
      const expected = scans[0](sample.text);
      assert.ok(expected.length, sample.name);
      for (const scan of scans) {
        const checkpoints = [];
        assert.deepEqual(scan(sample.text, undefined, checkpoints), expected);
        for (const checkpoint of checkpoints)
          assert.deepEqual(
            scan(sample.text, checkpoint),
            expected
              .filter(([, end]) => end > checkpoint[0])
              .map(([start, end, kind]) => [Math.max(start, checkpoint[0]), end, kind])
          );
        let document = createDocument(scan, sample.text, 2);
        for (const piece of ['\n', '42', '', '"', '}', '/*']) {
          const start = Math.floor(document.text.length / 2);
          document = editDocument(scan, document, start, Math.min(start + 1, document.text.length), piece);
          assert.deepEqual(document.ranges, scans[0](document.text));
        }
      }
      for (const [needle, kind, skip = 0] of sample.checks ?? []) {
        const found = sample.text.indexOf(needle);
        assert.ok(found >= 0, needle);
        for (let index = found + skip; index < found + needle.length; index++)
          assert.ok(
            expected.some(([from, to, category]) => from <= index && index < to && categories[category] === kind),
            `${sample.name}: ${needle}`
          );
      }
    }
  });

test('generated HTML preserves nested tagged templates inside script regions', () => {
  const text = '<script>const v = html`<p title="${42}">x</p>`;</script>';
  for (const generated of generations) {
    const ranges = createScanner(generated.machines.get('html'))(text);
    for (const [needle, kind] of [
      ['title', 'attribute'],
      ['42', 'number']
    ]) {
      const offset = text.indexOf(needle);
      assert.ok(
        ranges.some(([start, end, category]) => start <= offset && end > offset && categories[category] === kind)
      );
    }
  }
});

test('generated entrypoints register all languages without DOM and reuse lazy scanners', async () => {
  for (const generated of generations) {
    const registry = await import(new URL('../language-registry.mjs', generated.url));
    assert.throws(() => registry.getScanner('json'), /Unknown language/);
    for (const language of languages) {
      await import(new URL(`register-${language}.mjs`, generated.url));
      const scan = registry.getScanner(language);
      assert.equal(registry.getScanner(language), scan);
      assert.throws(() => registry.getScanner(language.toUpperCase()), /Unknown language/);
      const sample = samples.find(sample => sample.language === language);
      assert.deepEqual(scan(sample.text), createScanner(generated.machines.get(language))(sample.text));
    }
    assert.throws(() => registry.getScanner('__proto__'), /Unknown language/);
    const original = registry.getScanner('json');
    assert.throws(() => registry.getScanner('jsonc'), /Unknown language/);
    registry.registerLanguage('json', generated.machines.get('json'));
    assert.notEqual(registry.getScanner('json'), original);
  }
});
