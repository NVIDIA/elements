// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { Linter, RuleTester, type JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import noInvalidNumericValue from './no-invalid-numeric-value.js';

const rule = noInvalidNumericValue as unknown as JSRuleDefinition;
const formatters = [
  { tagName: 'nve-format-number', attribute: 'number' },
  { tagName: 'nve-format-bytes', attribute: 'value' }
];

describe('noInvalidNumericValue', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({ languageOptions: { parser: htmlParser } });
  });

  it('should register the rule as a recommended error', () => {
    const plugin = elementsHtmlConfig.plugins?.['@nvidia-elements/lint'];
    expect(plugin?.rules?.['no-invalid-numeric-value']).toBe(noInvalidNumericValue);
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-invalid-numeric-value']).toEqual(['error']);
  });

  it.each(formatters)('should allow finite and empty input for $tagName', ({ tagName, attribute }) => {
    const values = ['0', '-42', '+4', '1234.56', '1e3', '1e-999', '0xFF', '0b101', '0o77', ' 12 ', '', '   '];
    tester.run('finite numeric literals', rule, {
      valid: [
        ...values.flatMap(value => [
          `<${tagName} ${attribute}="${value}"></${tagName}>`,
          `<${tagName}>${value}</${tagName}>`
        ]),
        `<${tagName} ${attribute}>not-a-number</${tagName}>`,
        `<${tagName}>1<!-- ignored comment -->2</${tagName}>`
      ],
      invalid: []
    });
  });

  it.each(formatters)('should report invalid numeric input for $tagName', ({ tagName, attribute }) => {
    const values = ['not-a-number', 'NaN', 'Infinity', '-Infinity', '1e309', '1,234', '12px', '95%'];
    tester.run('invalid numeric literals', rule, {
      valid: [],
      invalid: values.flatMap(value => {
        const errors = [{ messageId: 'invalid-numeric-value', data: { tagName, value } }];
        return [
          { code: `<${tagName} ${attribute}="${value}">1234</${tagName}>`, errors },
          { code: `<${tagName}> ${value} </${tagName}>`, errors },
          { code: `<${tagName}><!-- ignored comment -->${value}</${tagName}>`, errors }
        ];
      })
    });
  });

  it.each(formatters)('should give the numeric attribute precedence for $tagName', ({ tagName, attribute }) => {
    tester.run('attribute precedence', rule, {
      valid: [
        `<${tagName} ${attribute}="0">not-a-number</${tagName}>`,
        `<${tagName} ${attribute}="">not-a-number</${tagName}>`,
        `<${tagName} ${attribute}="1234"><span>not-a-number</span></${tagName}>`
      ],
      invalid: []
    });
  });

  it.each(formatters)('should skip dynamic and encoded values for $tagName', ({ tagName, attribute }) => {
    const bindings = ['${amount}', '{{ amount }}', '{amount}', '{% amount %}'];
    const boundAttributes = [
      `.${attribute}`,
      `?${attribute}`,
      `:${attribute}`,
      `[${attribute}]`,
      `[attr.${attribute}]`,
      `v-bind:${attribute}`
    ];
    const contentBindings = ['v-text', 'v-html', '.textContent', '.innerHTML', '[textContent]', '[innerHTML]'];
    tester.run('unknown numeric values', rule, {
      valid: [
        ...bindings.flatMap(value => [
          `<${tagName} ${attribute}="${value}">not-a-number</${tagName}>`,
          `<${tagName}>${value}</${tagName}>`
        ]),
        ...boundAttributes.map(name => `<${tagName} ${name}="amount">not-a-number</${tagName}>`),
        ...contentBindings.map(name => `<${tagName} ${name}="amount">not-a-number</${tagName}>`),
        `<${tagName} v-bind="props">not-a-number</${tagName}>`,
        `<${tagName} \${attributes}>not-a-number</${tagName}>`,
        `<${tagName} {...props}>not-a-number</${tagName}>`,
        `<${tagName} ${attribute}="&#49;">not-a-number</${tagName}>`,
        `<${tagName}>&#49;&nbsp;</${tagName}>`,
        `<${tagName}><span>not-a-number</span></${tagName}>`
      ],
      invalid: []
    });
  });

  it('should ignore unrelated elements', () => {
    tester.run('other elements', rule, {
      valid: [
        '<div value="not-a-number">not-a-number</div>',
        '<nve-format-datetime date="not-a-date">not-a-date</nve-format-datetime>'
      ],
      invalid: []
    });
  });

  it.each([
    { filename: 'src/example.html', code: '<nve-format-number>NaN</nve-format-number>' },
    {
      filename: 'src/example.ts',
      code: 'const template = html`<nve-format-number number="Infinity"></nve-format-number>`;'
    },
    { filename: 'src/example.tsx', code: 'const template = <nve-format-bytes value="invalid" />;' },
    { filename: 'src/example.md', code: '```html\n<nve-format-bytes>invalid</nve-format-bytes>\n```' }
  ])('should report numeric errors through the HTML config in $filename', ({ filename, code }) => {
    const messages = new Linter().verify(code, [elementsHtmlConfig], { filename });
    expect(messages).toEqual([
      expect.objectContaining({
        ruleId: '@nvidia-elements/lint/no-invalid-numeric-value',
        messageId: 'invalid-numeric-value',
        severity: 2
      })
    ]);
  });
});
