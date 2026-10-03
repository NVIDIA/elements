// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { probeComponentLayout } from './component-layout-browser.mjs';

const runs = Number(process.argv[2] ?? 3);
if (process.argv.length > 3 || !Number.isInteger(runs) || runs < 1)
  throw new Error('Usage: measure-built-component.mjs [runs]');
const built = new URL('../../dist/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('highlight-grammars.json', built), 'utf8'));
const compiled = await Promise.all(
  manifest.languages.map(async entry => ({
    ...entry,
    machine: (await import(new URL(`internal/highlight/generated/${entry.language}.js`, built))).default
  }))
);
console.log(
  JSON.stringify(
    {
      node: process.version,
      representation: manifest.representation,
      languages: compiled.map(entry => entry.language),
      scope:
        'Actual bundled library, Lit and core, without theme font assets; first and repeated component updates, native memory and cleanup; update timings exclude forced layout and paint',
      results: await probeComponentLayout(
        fileURLToPath(new URL('../../', import.meta.url)),
        fileURLToPath(built),
        compiled,
        manifest.representation,
        runs
      )
    },
    null,
    2
  )
);
