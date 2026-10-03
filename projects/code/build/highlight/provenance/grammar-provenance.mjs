// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { loadGrammar } from '../compile.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const canonical = value =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === 'object'
      ? Object.fromEntries(
          Object.entries(value)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([key, value]) => [key, canonical(value)])
        )
      : value;

// Parser-relevant TextMate fields, before adapters. Excludes Shiki's display,
// alias and embedding-loader metadata. This runs only during generation.
export function grammarFingerprint(grammar) {
  return hash(
    JSON.stringify(
      canonical(
        Object.fromEntries(
          ['scopeName', 'patterns', 'repository', 'firstLineMatch', 'injections', 'injectionSelector']
            .filter(key => key in grammar)
            .map(key => [key, grammar[key]])
        )
      )
    )
  );
}

export async function grammarProvenance(pinned) {
  pinned ??= JSON.parse(await readFile(new URL('./grammar-sources.json', import.meta.url), 'utf8'));
  const installed = JSON.parse(
    await readFile(new URL('../package.json', import.meta.resolve('@shikijs/langs')), 'utf8')
  );
  if (installed.version !== pinned.shikiVersion)
    throw new Error('Shiki version changed; refresh grammar source attribution');
  const sources = await Promise.all(
    pinned.sources.map(async entry => {
      const grammar = await loadGrammar(entry.module);
      if (grammarFingerprint(grammar) !== entry.grammarSha256)
        throw new Error(`Grammar source changed: ${entry.language}; refresh source attribution`);
      const data = await readFile(new URL(import.meta.resolve(entry.module)));
      return { ...entry, sha256: hash(data) };
    })
  );
  const notices = await Promise.all(
    pinned.licenses.map(async entry => {
      const text = await readFile(new URL(`./licenses/${entry.file}`, import.meta.url), 'utf8');
      if (hash(text) !== entry.sha256) throw new Error(`Grammar license changed: ${entry.file}`);
      return `${entry.name}\n${entry.source}\n\n${text.trim()}\n`;
    })
  );
  for (const [name, url] of [
    ['@shikijs/langs', new URL('../LICENSE', import.meta.resolve('@shikijs/langs'))],
    ['highlight.js build-time vocabulary', new URL('../LICENSE', import.meta.resolve('highlight.js/lib/core'))]
  ])
    notices.push(`${name}\n\n${(await readFile(url, 'utf8')).trim()}\n`);
  return {
    sources,
    archive: pinned.archive,
    licenses: pinned.licenses,
    notice: `Generated grammar attribution\n\nThese grammar sources have been adapted and compiled into indexed machine data.\n\n${notices.join('\n----------------------------------------\n\n')}`
  };
}
