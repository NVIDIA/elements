// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { Linter, RuleTester } from 'eslint';
import htmlParser from '@html-eslint/parser';
import rule from './no-invalid-meter-group.js';
import { elementsHtmlConfig } from '../configs/html.js';

const group = (children: string) => `<nve-meter-group>${children}</nve-meter-group>`;
const meter = (attributes = '') => `<nve-meter ${attributes}></nve-meter>`;

describe('no-invalid-meter-group', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({ languageOptions: { parser: htmlParser } });
  });

  it('registers as a recommended error with generated documentation', () => {
    expect(elementsHtmlConfig.plugins?.['@nvidia-elements/lint']?.rules?.['no-invalid-meter-group']).toBe(rule);
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-invalid-meter-group']).toEqual(['error']);
    expect(rule.meta.docs.url).toContain('/docs/lint/rules/no-invalid-meter-group/');
  });

  it('accepts defaults, partial capacity, full capacity, and independent groups', () => {
    tester.run('valid static groups', rule, {
      valid: [
        group(''),
        group(meter()),
        group(meter('value="20"') + meter('value="30" min="0" max="100"')),
        group(meter('value="80" max="128"') + meter('value="48" max="128"')),
        group(Array.from({ length: 22 }, () => meter('value="1" max="22"')).join('')),
        group(Array.from({ length: 10 }, () => meter('value="0.1" max="1"')).join('')),
        group(meter('value="100"')) + group(meter('value="100"')),
        `<div>${meter('max="50"')}${meter('max="100"')}</div>`,
        '<nve-meter value="100"></nve-meter>'
      ],
      invalid: []
    });
  });

  it('compares effective bounds, including normalization and collapsed ranges', () => {
    tester.run('effective bounds', rule, {
      valid: [
        group(meter('min="NaN" max="Infinity" value="bad"') + meter()),
        group(meter('min="10" max="5" value="30"') + meter('min="10" max="10"')),
        group(meter('min="-50" max="50" value="0"') + meter('min="-50" max="50" value="0"')),
        group(meter('min="10" max="110" value="30"') + meter('min="10" max="110" value="90"')),
        group(meter('max="0" value="50"') + meter('max="-10" value="50"')),
        group(meter('value="200"') + meter('value="-20"')),
        group(meter('max="0x64"') + meter('max="1e2"'))
      ],
      invalid: [
        group(meter('max="128"') + meter()),
        group(meter('min="10"') + meter()),
        group(meter('min="10" max="5"') + meter('min="10" max="20"')),
        group(meter('min="-10" max="10"') + meter('min="0" max="10"'))
      ].map(code => ({ code, errors: [{ messageId: 'mismatched-bounds' }] }))
    });
  });

  it('rejects totals above the shared range without normalizing against their sum', () => {
    tester.run('excess capacity', rule, {
      valid: [],
      invalid: [
        group(meter('value="80"') + meter('value="80"')),
        group(meter('value="80" max="128"') + meter('value="80" max="128"')),
        group(meter('value="30" min="10" max="110"') + meter('value="100" min="10" max="110"')),
        group(meter('value="200"') + meter('value="1"')),
        group(Array.from({ length: 3 }, () => meter('min="-50" max="50"')).join(''))
      ].map(code => ({ code, errors: [{ messageId: 'excess-capacity' }] }))
    });
  });

  it('skips unknown numeric inputs and property overrides', () => {
    const bindings = [
      '.value=${value}',
      ':value="value"',
      '[value]="value"',
      'v-bind:value="value"',
      'value="${value}"',
      'value="{{ value }}"',
      'value="{value}"',
      'value="{% value %}"',
      'value="&#56;0"',
      'value="80" .value=${value}',
      'value="80" {...props}',
      'value="80" v-bind="props"',
      'value="80" ${attributes}'
    ];
    tester.run('dynamic inputs', rule, {
      valid: [
        ...bindings.map(attributes => group(meter('value="80"') + meter(attributes))),
        group(meter('max="100" .max=${maximum}') + meter('max="128"')),
        group(meter('min="&#48;"') + meter('min="10"')),
        group(meter('max="100"') + meter('max="{maximum}"')),
        group(meter('max="100"') + meter(':min="minimum" max="128"'))
      ],
      invalid: [
        {
          code: group(meter('max="128" .value=${value}') + meter()),
          errors: [{ messageId: 'mismatched-bounds' }]
        },
        {
          code: group(meter('max="128"') + meter() + meter('.max=${maximum}')),
          errors: [{ messageId: 'mismatched-bounds' }]
        }
      ]
    });
  });

  it('uses only direct default-slot meters', () => {
    tester.run('direct children', rule, {
      valid: [
        group(meter('value="80"') + meter('value="80" slot="suffix"')),
        group(meter('value="80"') + meter('value="80" :slot="slot"')),
        group(meter('value="80"') + `<div>${meter('value="80" max="50"')}</div>`),
        group(meter('value="80"') + '<!-- ignored -->' + meter('value="20"'))
      ],
      invalid: [
        {
          code: group(meter('value="80" slot=""') + meter('value="80"')),
          errors: [{ messageId: 'excess-capacity' }]
        }
      ]
    });
  });

  it('does not combine alternative branches or speculate about generated children', () => {
    tester.run('dynamic membership', rule, {
      valid: [
        group(meter('value="80" v-if="show"') + meter('value="80" v-else')),
        group(meter('value="80" *ngIf="show"') + meter('value="80" *ngIf="!show"')),
        group(meter('value="80" *ngFor="let item of items"') + meter('value="80"')),
        group(meter('value="80" v-for="item in items"') + meter('value="80"')),
        group('${show ? html`<nve-meter value="80"></nve-meter>` : html`<nve-meter value="80"></nve-meter>`}'),
        group('{show ? <nve-meter value="80" /> : <nve-meter value="80" />}'),
        group('{{ children }}')
      ],
      invalid: []
    });
  });

  it('ignores inline Markdown mentions', () => {
    const invalid = group(meter('value="80"') + meter('value="80"'));
    tester.run('inline Markdown', rule, {
      valid: [invalid, `<div>${invalid}</div>`, `<div><section>${invalid}</section></div>`].map(code => ({
        filename: 'src/example.md',
        code: 'Use `' + code + '`.'
      })),
      invalid: []
    });
  });

  it.each([
    {
      filename: 'src/example.tsx',
      code: 'const view = <nve-meter-group>{show ? <nve-meter value="80" /> : <nve-meter value="80" />}</nve-meter-group>;'
    },
    {
      filename: 'src/example.tsx',
      code: 'const view = <nve-meter-group><nve-meter value="80" /><nve-meter value={value} /></nve-meter-group>;'
    },
    {
      filename: 'src/example.ts',
      code: 'const view = html`<nve-meter-group>${items.map(item => html`<nve-meter value="80"></nve-meter>`)}</nve-meter-group>`;'
    }
  ])('skips unknown compositions through the recommended config in $filename', ({ filename, code }) => {
    const messages = new Linter().verify(code, [elementsHtmlConfig], { filename });
    expect(messages.filter(message => message.ruleId === '@nvidia-elements/lint/no-invalid-meter-group')).toEqual([]);
  });

  it.each([
    { filename: 'src/example.html', code: group(meter('value="80"') + meter('value="80"')) },
    { filename: 'src/example.ts', code: `const view = html\`${group(meter('value="80"') + meter('value="80"'))}\`;` },
    { filename: 'src/example.tsx', code: `const view = ${group(meter('value="80"') + meter('value="80"'))};` },
    { filename: 'src/example.md', code: '```html\n' + group(meter('value="80"') + meter('value="80"')) + '\n```' }
  ])('reports through the recommended config in $filename', ({ filename, code }) => {
    const messages = new Linter().verify(code, [elementsHtmlConfig], { filename });
    expect(messages.filter(message => message.ruleId === '@nvidia-elements/lint/no-invalid-meter-group')).toEqual([
      expect.objectContaining({ severity: 2, messageId: 'excess-capacity' })
    ]);
  });
});
