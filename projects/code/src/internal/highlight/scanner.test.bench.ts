// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test } from 'vitest';
import { createScanner } from './scanner.mjs';
import { createDocument, editDocument } from '../../code-textarea/internal/incremental.mjs';
import { machineCases } from '../../../tests/highlight/fixtures/machine-corpus.mjs';

declare const __NVE_SCANNER_MACHINES__: string;
const machines: Record<string, object> = JSON.parse(__NVE_SCANNER_MACHINES__);
const options = { throws: true, iterations: 10, time: 500, warmupIterations: 5, warmupTime: 100 };

describe('syntax scanner', () => {
  for (const language of ['json', 'javascript', 'markdown', 'python', 'yaml']) {
    const machine = machines[language];
    if (!machine) throw new Error(`Missing compiled benchmark grammar: ${language}`);
    const scan = createScanner(machine);
    const corpus = machineCases
      .filter(sample => sample.language === language)
      .map(sample => sample.text)
      .join('\n');
    for (const copies of [1, 5]) {
      const text = `${corpus}\n`.repeat(copies);
      const previous = createDocument(scan, text, 8);
      const start = Math.floor(text.length / 2);
      for (const mode of ['fresh', 'repeated', 'incremental']) {
        const label = `scans ${copies} ${language} corpus copies using ${mode}`;
        test(label, async ({ bench }) => {
          await bench(label, () => {
            if (mode === 'fresh') return createScanner(machine)(text);
            if (mode === 'incremental') return editDocument(scan, previous, start, start + 1, '42');
            return scan(text);
          }).run(options);
        });
      }
    }
  }
});
