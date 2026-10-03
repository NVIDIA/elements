// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchFnOptions, BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { elementIsStable } from '@internals/testing';
import { CodeBlock } from '@nvidia-elements/code/codeblock';
import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/code/codeblock/languages/javascript.js';
import '@nvidia-elements/code/codeblock/languages/python.js';
import '@nvidia-elements/code/codeblock/languages/markdown.js';
import { pythonWorkload } from '../../tests/highlight/fixtures/python-corpus.mjs';

const runOptions = {
  throws: true,
  iterations: 10,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;

const script =
  'const view = html`<section title="${42}"><style>.x{color:red;}</style>${name}</section>`; const rule = /abc+/g; function read(value){return css`.x { content:"${value}";width:42px; }`;}\n';
const workloads: { language: CodeBlock['language']; label: string; text: string; decorations: boolean[] }[] = [
  ...[100, 500].map(records => ({
    language: 'json' as const,
    label: `${records} JSON records`,
    text: JSON.stringify(
      Array.from({ length: records }, (_, n) => ({ n, value: 'first', enabled: true })),
      null,
      2
    ),
    decorations: [false, true]
  })),
  { language: 'python', label: '50 Python corpus copies', text: pythonWorkload(50).trim(), decorations: [false] },
  {
    language: 'javascript',
    label: '100 embedded JavaScript copies',
    text: script.repeat(100).trim(),
    decorations: [false]
  },
  {
    language: 'markdown',
    label: '20 embedded Markdown copies',
    text: `# Title\n\n\u0060\u0060\u0060python\n${pythonWorkload(1)}\n\u0060\u0060\u0060\n\n> quoted **bold**\n\u0060\u0060\u0060javascript\n${script}\u0060\u0060\u0060\n`
      .repeat(20)
      .trim(),
    decorations: [false]
  }
];

describe(CodeBlock.metadata.tag, () => {
  for (const workload of workloads) {
    const original = workload.text;
    const edited = original.replaceAll('first', 'other').replaceAll('42', '43');
    for (const decorated of workload.decorations) {
      const label = `updates ${workload.label}${decorated ? ' with line decorations' : ''}`;
      test(label, async ({ bench }) => {
        let element: CodeBlock;
        let forward = true;
        const options: BenchFnOptions = {
          async beforeAll() {
            element = new CodeBlock();
            element.language = workload.language;
            element.lineNumbers = decorated;
            element.highlight = decorated ? '2-4,10,250-252' : undefined;
            element.code = original;
            forward = true;
            document.body.append(element);
            await elementIsStable(element);
          },
          afterAll() {
            element.remove();
          }
        };
        await bench(label, options, async () => {
          element.code = forward ? edited : original;
          forward = !forward;
          await elementIsStable(element);
          // Include layout work caused by the changed code, but exclude paint.
          return element.offsetHeight;
        }).run(runOptions);
      });
    }
  }
});
