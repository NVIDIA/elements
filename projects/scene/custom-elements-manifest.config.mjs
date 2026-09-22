// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import baseConfig from '../internals/vite/src/plugins/cem.config.mjs';

function sourceFiles(directory) {
  return readdirSync(resolve(directory), { recursive: true })
    .filter(path => typeof path === 'string' && path.endsWith('.ts'))
    .map(path => resolve(directory, path));
}

export default {
  ...baseConfig,
  exclude: [...baseConfig.exclude, ...sourceFiles('src/internal'), resolve('src/errors.ts')]
};
