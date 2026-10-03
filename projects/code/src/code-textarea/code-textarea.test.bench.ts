// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test } from 'vitest';
import type { BenchFnOptions, BenchRunOptions } from 'vitest';
import { Textarea } from '@nvidia-elements/core/textarea';
import '@nvidia-elements/core/textarea/define.js';
import { CodeTextarea } from './code-textarea.js';
import './define.js';
import '../codeblock/languages/json.js';
import '../codeblock/languages/markdown.js';

const options = {
  throws: true,
  iterations: 10,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;
const workloads = [
  {
    language: 'json' as const,
    text: JSON.stringify(
      Array.from({ length: 500 }, (_, index) => ({ index, value: 'first', enabled: true })),
      null,
      2
    )
  },
  {
    language: 'markdown' as const,
    text: '# Title\n\n~~~typescript\nconst first = "value";\n~~~\n\n> quoted **text**\n\n'.repeat(50)
  }
];

describe('native code textarea edit and range registration', () => {
  for (const workload of workloads) {
    for (const mode of ['plain', 'incremental', 'complete']) {
      test(`${workload.language} ${mode}`, async ({ bench }) => {
        let element: Textarea | CodeTextarea;
        let textarea: HTMLTextAreaElement;
        let edit: number;
        let forward = true;
        const setup: BenchFnOptions = {
          async beforeAll() {
            if (!('createValueRange' in HTMLTextAreaElement.prototype)) {
              throw new Error('Benchmark requires native opaque ranges');
            }
            element = mode === 'plain' ? new Textarea() : new CodeTextarea();
            if (element instanceof CodeTextarea) element.language = workload.language;
            textarea = document.createElement('textarea');
            textarea.value = workload.text;
            textarea.rows = 8;
            element.append(textarea);
            document.body.append(element);
            await element.updateComplete;
            edit = workload.text.indexOf('first', Math.floor(workload.text.length / 2));
            if (edit < 0) throw new Error('Missing edit location');
          },
          afterAll() {
            element.remove();
          }
        };
        const label = `${workload.language} ${mode}`;
        await bench(label, setup, async () => {
          const insertion = forward ? 'other' : 'first';
          forward = !forward;
          textarea.setRangeText(insertion, edit, edit + 5);
          textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: insertion }));
          if (mode === 'complete' && element instanceof CodeTextarea) element.refreshHighlighting();
          await element.updateComplete;
        }).run(options);
      });
    }
  }
});
