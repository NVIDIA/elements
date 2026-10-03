// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const directory = fileURLToPath(new URL('../../', import.meta.url));
const esbuild = fileURLToPath(new URL('../../node_modules/.bin/esbuild', import.meta.url));
function size(source) {
  const result = spawnSync(
    esbuild,
    [
      '--bundle',
      '--minify',
      '--format=esm',
      '--platform=browser',
      '--loader=js',
      '--external:lit',
      '--external:lit/*',
      '--external:@nvidia-elements/core',
      '--external:@nvidia-elements/core/*',
      '--log-level=error'
    ],
    { cwd: directory, input: source, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }
  );
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message);
  return {
    minified: Buffer.byteLength(result.stdout),
    gzip: gzipSync(result.stdout).length,
    brotli: brotliCompressSync(result.stdout).length
  };
}
const manifest = JSON.parse(await readFile(new URL('../../dist/highlight-grammars.json', import.meta.url), 'utf8'));
const languages = manifest.languages.map(entry => entry.language);
const registrations = names => names.map(name => `import './dist/codeblock/languages/${name}.js';`).join('');
const componentSize = (components, names) =>
  size(
    components
      .map(component => `export * from './dist/${component}/index.js'; import './dist/${component}/define.js';`)
      .join('') + registrations(names)
  );
console.log(
  JSON.stringify(
    {
      node: process.version,
      representation: manifest.representation,
      scope:
        'Minified built ESM closures, gzip and Brotli. Component records include styles, define and default shell. Scanner/data records exclude components, rendering and incremental helpers. Lit/core external.',
      scanner: size("export {createScanner} from './dist/internal/highlight/scanner.js';"),
      records: [...languages, 'all'].map(language => {
        const names = language === 'all' ? languages : [language];
        return {
          language,
          dependencies:
            language === 'all' ? languages : manifest.languages.find(entry => entry.language === language).dependencies,
          scannerAndData: size(
            "export {getScanner} from './dist/internal/highlight/language-registry.js';" + registrations(names)
          ),
          codeblock: componentSize(['codeblock'], names),
          textarea: componentSize(['code-textarea'], names),
          both: componentSize(['codeblock', 'code-textarea'], names)
        };
      })
    },
    null,
    2
  )
);
