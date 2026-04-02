// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Example } from '../types.js';

export function getExamples(): Example[] {
  return globSync(resolve('../../../projects/**/dist/**/*.examples.json'))
    .filter(path => !path.includes('node_modules'))
    .flatMap(path => {
      const examples = JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
      return examples.items.map((s: Record<string, unknown>) => ({
        ...s,
        element: examples.element ?? '',
        entrypoint: examples.entrypoint ?? ''
      }));
    });
}
