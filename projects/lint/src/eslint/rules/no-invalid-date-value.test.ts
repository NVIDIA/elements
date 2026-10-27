// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { Linter, RuleTester, type JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import noInvalidDateValue from './no-invalid-date-value.js';

const rule = noInvalidDateValue as unknown as JSRuleDefinition;
const formatters = ['nve-format-datetime', 'nve-format-relative-time'];

describe('noInvalidDateValue', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({ languageOptions: { parser: htmlParser } });
  });

  it('should register the rule as a recommended error', () => {
    const plugin = elementsHtmlConfig.plugins?.['@nvidia-elements/lint'];
    expect(plugin?.rules?.['no-invalid-date-value']).toBe(noInvalidDateValue);
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-invalid-date-value']).toEqual(['error']);
  });

  it.each(formatters)('should allow dates accepted by JavaScript and empty input for %s', tagName => {
    const values = [
      '2026-10-26',
      '2026-10-26T12:30:00Z',
      '2026-10-26T12:30:00.123+02:00',
      '2026-10-26T12:30:00',
      '2026-10',
      '2026',
      'October 26, 2026',
      'Mon, 26 Oct 2026 12:30:00 GMT',
      '2026-02-30',
      ''
    ];
    tester.run('accepted date literals', rule, {
      valid: [
        ...values.flatMap(value => [
          `<${tagName} date="${value}"></${tagName}>`,
          `<${tagName}> ${value} </${tagName}>`
        ]),
        `<${tagName} date>not-a-date</${tagName}>`,
        `<${tagName}>2026-<!-- ignored comment -->10-26</${tagName}>`
      ],
      invalid: []
    });
  });

  it.each(formatters)('should report invalid date input for %s', tagName => {
    const values = [
      'not-a-date',
      'Invalid Date',
      'NaN',
      'Infinity',
      '2026-13-01',
      '2026-01-32',
      '2026-10-26T25:00:00Z',
      '+999999-01-01'
    ];
    tester.run('invalid date literals', rule, {
      valid: [],
      invalid: values.flatMap(value => {
        const errors = [{ messageId: 'invalid-date-value', data: { tagName, value } }];
        return [
          { code: `<${tagName} date="${value}">2026-10-26</${tagName}>`, errors },
          { code: `<${tagName}> ${value} </${tagName}>`, errors },
          { code: `<${tagName}><!-- ignored comment -->${value}</${tagName}>`, errors }
        ];
      })
    });
  });

  it.each(formatters)('should give the date attribute precedence for %s', tagName => {
    tester.run('attribute precedence', rule, {
      valid: [
        `<${tagName} date="2026-10-26">not-a-date</${tagName}>`,
        `<${tagName} date="">not-a-date</${tagName}>`,
        `<${tagName} date="2026-10-26"><span>not-a-date</span></${tagName}>`
      ],
      invalid: []
    });
  });

  it.each(formatters)('should distinguish empty text from invalid whitespace attributes for %s', tagName => {
    tester.run('empty input', rule, {
      valid: [`<${tagName}>   </${tagName}>`],
      invalid: [
        {
          code: `<${tagName} date=" ">2026-10-26</${tagName}>`,
          errors: [{ messageId: 'invalid-date-value', data: { tagName, value: ' ' } }]
        }
      ]
    });
  });

  it.each(formatters)('should skip dynamic and encoded values for %s', tagName => {
    const bindings = ['${date}', '{{ date }}', '{date}', '{% date %}'];
    const boundAttributes = ['.date', '?date', ':date', '[date]', '[attr.date]', 'v-bind:date'];
    const contentBindings = ['v-text', 'v-html', '.textContent', '.innerHTML', '[textContent]', '[innerHTML]'];
    tester.run('unknown date values', rule, {
      valid: [
        ...bindings.flatMap(value => [
          `<${tagName} date="${value}">not-a-date</${tagName}>`,
          `<${tagName}>${value}</${tagName}>`
        ]),
        ...boundAttributes.map(name => `<${tagName} ${name}="date">not-a-date</${tagName}>`),
        ...contentBindings.map(name => `<${tagName} ${name}="date">not-a-date</${tagName}>`),
        `<${tagName} v-bind="props">not-a-date</${tagName}>`,
        `<${tagName} \${attributes}>not-a-date</${tagName}>`,
        `<${tagName} {...props}>not-a-date</${tagName}>`,
        `<${tagName} date="&#50;026-10-26">not-a-date</${tagName}>`,
        `<${tagName}>&#50;026-10-26</${tagName}>`,
        `<${tagName}><span>not-a-date</span></${tagName}>`
      ],
      invalid: []
    });
  });

  it('should ignore unrelated elements', () => {
    tester.run('other elements', rule, {
      valid: [
        '<time datetime="not-a-date">not-a-date</time>',
        '<nve-format-number number="not-a-number">not-a-number</nve-format-number>'
      ],
      invalid: []
    });
  });

  it.each([
    { filename: 'src/example.html', code: '<nve-format-datetime>not-a-date</nve-format-datetime>' },
    {
      filename: 'src/example.ts',
      code: 'const template = html`<nve-format-datetime date="not-a-date"></nve-format-datetime>`;'
    },
    { filename: 'src/example.tsx', code: 'const template = <nve-format-relative-time date="not-a-date" />;' },
    {
      filename: 'src/example.md',
      code: '```html\n<nve-format-relative-time>not-a-date</nve-format-relative-time>\n```'
    }
  ])('should report date errors through the HTML config in $filename', ({ filename, code }) => {
    const messages = new Linter().verify(code, [elementsHtmlConfig], { filename });
    expect(messages).toEqual([
      expect.objectContaining({
        ruleId: '@nvidia-elements/lint/no-invalid-date-value',
        messageId: 'invalid-date-value',
        severity: 2
      })
    ]);
  });
});
