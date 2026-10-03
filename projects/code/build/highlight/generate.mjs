// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { compileGrammar } from './compile.mjs';
import { categories } from '../../src/internal/highlight/categories.mjs';
import { languages, loadLanguage } from './loaders/load-language.mjs';
import { fragmentExpressions } from './optimizations/fragment-expressions.mjs';
import { fragmentModules } from './optimizations/fragment-modules.mjs';
import { elideIndices } from './optimizations/elide-indices.mjs';
import { grammarProvenance } from './provenance/grammar-provenance.mjs';
import { generator, writeGeneration } from './write-generation.mjs';

export { writeGeneration };

const hash = value => createHash('sha256').update(value).digest('hex');
const header = '// Generated indexed machine data; source provenance is in manifest.json.\n// prettier-ignore\n';

export async function compileLanguages(nativeCase = false) {
  return Promise.all(
    languages.map(async language => {
      const loaded = await loadLanguage(language);
      return {
        language,
        scope: loaded.grammar.scopeName,
        profile: loaded.profile,
        dependencies: [...loaded.languages].sort(),
        machine: compileGrammar(loaded.grammar, loaded.related, { shared: true, compact: true, nativeCase })
      };
    })
  );
}

// Group identical expressions by their entrypoint owners. Importing one language
// cannot pull expressions used exclusively by unrelated languages.
export function emitMachines(compiled, pooled = false) {
  const files = new Map();
  const expressions = new Map();
  if (pooled)
    compiled.forEach(({ machine }, owner) => {
      for (const expression of machine.expressions) {
        const key = JSON.stringify(expression);
        const entry = expressions.get(key) ?? { expression, owners: 0n };
        entry.owners |= 1n << BigInt(owner);
        expressions.set(key, entry);
      }
    });
  const groups = new Map();
  for (const [key, entry] of [...expressions].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (!(entry.owners & (entry.owners - 1n))) continue;
    const group = groups.get(entry.owners) ?? [];
    entry.file = `expressions-${entry.owners.toString(16)}.mjs`;
    entry.name = `e${group.length}`;
    group.push(`${entry.name}=${key}`);
    groups.set(entry.owners, group);
  }
  for (const [owners, group] of groups)
    files.set(`expressions-${owners.toString(16)}.mjs`, `${header}export const ${group.join(',')};\n`);
  for (const { language, machine } of compiled) {
    if (!pooled) {
      files.set(`${language}.mjs`, `${header}export default ${JSON.stringify(machine)};\n`);
      continue;
    }
    const imports = new Map();
    const refs = machine.expressions.map((expression, index) => {
      const key = JSON.stringify(expression);
      const entry = expressions.get(key);
      if (!entry.file) return key;
      const names = imports.get(entry.file) ?? new Map();
      if (!names.has(entry.name)) names.set(entry.name, `r${index}`);
      imports.set(entry.file, names);
      return names.get(entry.name);
    });
    const statements = [...imports]
      .map(
        ([file, names]) =>
          `import{${[...names].map(([name, alias]) => `${name} as ${alias}`).join(',')}}from'./${file}';`
      )
      .join('\n');
    const object = `{${Object.entries(machine)
      .map(
        ([key, value]) =>
          `${JSON.stringify(key)}:${key === 'expressions' ? `[${refs.join(',')}]` : JSON.stringify(value)}`
      )
      .join(',')}}`;
    files.set(`${language}.mjs`, `${header}${statements}\nexport default ${object};\n`);
  }
  return files;
}

export async function generateLanguages(
  pooled = false,
  nativeCase = false,
  fragments = false,
  sharedFragments = false,
  options = {}
) {
  if (fragments && sharedFragments) throw new Error('Choose local or shared fragments');
  const attribution = await grammarProvenance();
  if (JSON.stringify(attribution.sources.map(entry => entry.language)) !== JSON.stringify(languages))
    throw new Error('Language set changed; refresh grammar source attribution');
  const compiled = (await compileLanguages(nativeCase)).map(entry => ({
    ...entry,
    machine: options.allIndices ? entry.machine : elideIndices(entry.machine)
  }));
  let files = emitMachines(compiled, pooled);
  if (fragments) for (const [name, source] of files) files.set(name, fragmentExpressions(source));
  if (sharedFragments) files = fragmentModules(files);
  for (const { language } of compiled)
    files.set(
      `register-${language}.mjs`,
      `${header}import{registerLanguage}from'../language-registry.mjs';\nimport machine from'./${language}.mjs';\nregisterLanguage(${JSON.stringify(language)},machine);\n`
    );
  for (const { language } of compiled) files.set(`register-${language}.d.mts`, 'export {};\n');
  files.set('GRAMMAR-LICENSES.txt', attribution.notice);
  const packageInfo = async (name, relative, entry) => {
    const metadata = JSON.parse(await readFile(new URL(relative, import.meta.resolve(entry)), 'utf8'));
    return { name, version: metadata.version, declaredPackageLicense: metadata.license };
  };
  const buildSources = await Promise.all(
    ['core', ...['bash', 'go', 'javascript', 'typescript', 'xml'].map(name => `languages/${name}`)].map(async path => {
      const module = `highlight.js/lib/${path}`;
      return { module, sha256: hash(await readFile(new URL(import.meta.resolve(module)))) };
    })
  );
  const manifest = {
    generator,
    format: 1,
    representation: `compact${pooled ? '-pooled' : ''}${nativeCase ? '-native-case' : ''}${sharedFragments ? '-shared-fragments' : fragments ? '-fragments' : ''}${options.allIndices ? '' : '-selective-indices'}`,
    sourcePackages: await Promise.all([
      packageInfo('@shikijs/langs', '../package.json', '@shikijs/langs'),
      packageInfo('highlight.js', '../package.json', 'highlight.js/lib/core')
    ]),
    sources: attribution.sources,
    sourceArchive: attribution.archive,
    grammarLicenses: attribution.licenses,
    buildSources,
    categories,
    languages: compiled.map(({ machine, ...metadata }) => ({
      ...metadata,
      states: machine.states.length,
      rules: machine.rules.length,
      expressions: machine.expressions.length,
      machineSha256: hash(JSON.stringify(machine))
    })),
    files: [...files]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([name, source]) => ({ name, sha256: hash(source) }))
  };
  files.set('manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  return { files, manifest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const output = process.argv[2];
  const flags = process.argv.slice(3);
  if (
    !output ||
    flags.some(
      flag => !['--pooled', '--native-case', '--fragments', '--shared-fragments', '--all-indices'].includes(flag)
    )
  )
    throw new Error(
      'Usage: generate-languages.mjs output-directory [--pooled] [--native-case] [--fragments|--shared-fragments] [--all-indices]'
    );
  const { files, manifest } = await generateLanguages(
    flags.includes('--pooled'),
    flags.includes('--native-case'),
    flags.includes('--fragments'),
    flags.includes('--shared-fragments'),
    { allIndices: flags.includes('--all-indices') }
  );
  await writeGeneration(pathToFileURL(`${output.replace(/\/$/, '')}/`), files);
  console.log(JSON.stringify(manifest, null, 2));
}
