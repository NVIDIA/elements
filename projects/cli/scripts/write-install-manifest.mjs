// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const platformBinaries = [
  { key: 'macos-arm64', filename: 'nve-macos-arm64', source: 'nve-macos-arm64' },
  { key: 'macos-x64', filename: 'nve-macos-x64', source: 'nve-macos-x64' },
  { key: 'linux-x64', filename: 'nve-linux-x64', source: 'nve-linux-x64' },
  { key: 'linux-arm64', filename: 'nve-linux-arm64', source: 'nve-linux-arm64' },
  { key: 'windows-x64', filename: 'nve-windows-x64.exe', source: 'nve-windows-x64.exe' }
];

const manifestPath = resolve('dist/manifest.json');
const existingManifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf-8')) : {};
const indexContent = readFileSync(resolve('dist/index.js'));
const sha = existingManifest.sha || createHash('sha256').update(indexContent).digest('hex').slice(0, 12);
const platforms = Object.fromEntries(
  platformBinaries.map(({ key, filename, source }) => {
    const content = readFileSync(resolve('dist', source));
    return [key, { filename, checksum: createHash('sha256').update(content).digest('hex') }];
  })
);

writeFileSync(manifestPath, `${JSON.stringify({ sha, platforms }, null, 2)}\n`);
