// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { Linter, RuleTester, type JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import noInvalidNumberFormatOptions from './no-invalid-number-format-options.js';

const rule = noInvalidNumberFormatOptions as unknown as JSRuleDefinition;
const formatters = ['nve-format-number', 'nve-format-bytes'];

describe('noInvalidNumberFormatOptions', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({ languageOptions: { parser: htmlParser } });
  });

  it('should register as a recommended error', () => {
    expect(elementsHtmlConfig.plugins?.['@nvidia-elements/lint']?.rules?.['no-invalid-number-format-options']).toBe(
      noInvalidNumberFormatOptions
    );
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-invalid-number-format-options']).toEqual(['error']);
  });

  it.each(formatters)('should allow valid and unsupported well formed locales for %s', tag => {
    tester.run('valid locales', rule, {
      valid: [undefined, 'en-US', 'de-DE', 'en-u-nu-latn', 'zz-ZZ'].map(
        locale => `<${tag}${locale === undefined ? '' : ` locale="${locale}"`}>1234</${tag}>`
      ),
      invalid: []
    });
  });

  it.each(formatters)('should reject malformed locales for %s', tag => {
    tester.run('invalid locales', rule, {
      valid: [],
      invalid: ['', 'en_US', 'not_a_locale', 'en-US,de-DE'].map(value => ({
        code: `<${tag} locale="${value}">1234</${tag}>`,
        errors: [{ messageId: 'invalid-option' }]
      }))
    });
  });

  it.each(formatters)('should follow Intl digit coercion and defaults for %s', tag => {
    tester.run('valid digit options', rule, {
      valid: [
        'minimum-fraction-digits="0" maximum-fraction-digits="100"',
        'minimum-fraction-digits="100"',
        'maximum-fraction-digits="0"',
        'minimum-fraction-digits="3"',
        'minimum-fraction-digits="2.9" maximum-fraction-digits="2.1"',
        'minimum-fraction-digits="0x2" maximum-fraction-digits="2e0"',
        'minimum-fraction-digits=" " maximum-fraction-digits=""',
        'minimum-fraction-digits maximum-fraction-digits'
      ].map(attributes => `<${tag} ${attributes}>1234</${tag}>`),
      invalid: []
    });
  });

  it.each(formatters)('should reject invalid digit values for %s', tag => {
    tester.run('invalid digit values', rule, {
      valid: [],
      invalid: ['minimum-fraction-digits', 'maximum-fraction-digits'].flatMap(attribute =>
        ['-1', '-0.1', '101', '100.1', 'NaN', 'Infinity', '-Infinity', '1e309', 'two'].map(value => ({
          code: `<${tag} ${attribute}="${value}">1234</${tag}>`,
          errors: [{ messageId: 'invalid-option' }]
        }))
      )
    });
  });

  it.each(formatters)('should reject reversed fraction digit bounds for %s', tag => {
    tester.run('digit ordering', rule, {
      valid: [],
      invalid: [
        {
          code: `<${tag} minimum-fraction-digits="3" maximum-fraction-digits="2">1234</${tag}>`,
          errors: [{ messageId: 'invalid-digit-order', data: { tagName: tag } }]
        }
      ]
    });
  });

  it('should enforce integer digit bounds only for the number formatter', () => {
    tester.run('integer digit bounds', rule, {
      valid: ['1', '21', '2.9'].map(
        value => `<nve-format-number minimum-integer-digits="${value}">12</nve-format-number>`
      ),
      invalid: ['0', '22', '21.9', '', 'NaN'].map(value => ({
        code: `<nve-format-number minimum-integer-digits="${value}">12</nve-format-number>`,
        errors: [{ messageId: 'invalid-option' }]
      }))
    });
  });

  it.each(['currency', 'unit'])('should require a %s only for a known matching format style', style => {
    tester.run('required style options', rule, {
      valid: [
        '<nve-format-number>12</nve-format-number>',
        '<nve-format-number format-style="decimal">12</nve-format-number>',
        `<nve-format-number format-style="${style}" .${style}=\${value}>12</nve-format-number>`,
        `<nve-format-number format-style="${style}" :${style}="value">12</nve-format-number>`,
        `<nve-format-number format-style="${style}" [${style}]="value">12</nve-format-number>`,
        '<nve-format-number format-style="${style}">12</nve-format-number>',
        '<nve-format-number format-style="currency" .formatStyle=${style}>12</nve-format-number>'
      ],
      invalid: [
        {
          code: `<nve-format-number format-style="${style}">12</nve-format-number>`,
          errors: [{ messageId: 'missing-option', data: { tagName: 'nve-format-number', option: style } }]
        }
      ]
    });
  });

  it('should accept currency syntax without requiring a known currency', () => {
    tester.run('valid currency identifiers', rule, {
      valid: ['USD', 'usd', 'EUR', 'ZZZ'].map(
        currency => `<nve-format-number format-style="currency" currency="${currency}">12</nve-format-number>`
      ),
      invalid: ['', 'US', 'USDD', '123', ' USD '].map(currency => ({
        code: `<nve-format-number format-style="currency" currency="${currency}">12</nve-format-number>`,
        errors: [{ messageId: 'invalid-option' }]
      }))
    });
  });

  it('should validate simple and compound Intl unit identifiers', () => {
    tester.run('unit identifiers', rule, {
      valid: ['kilometer', 'byte', 'liter', 'meter-per-second'].map(
        unit => `<nve-format-number format-style="unit" unit="${unit}">12</nve-format-number>`
      ),
      invalid: ['', 'kilometers', 'mb', 'METER', 'meter-per-second-per-second'].map(unit => ({
        code: `<nve-format-number format-style="unit" unit="${unit}">12</nve-format-number>`,
        errors: [{ messageId: 'invalid-option' }]
      }))
    });
  });

  it('should validate supplied identifiers even when their style is inactive', () => {
    tester.run('inactive identifiers', rule, {
      valid: ['<nve-format-number currency="USD" unit="meter">12</nve-format-number>'],
      invalid: ['currency="bad!"', 'unit="bad"'].map(attribute => ({
        code: `<nve-format-number ${attribute}>12</nve-format-number>`,
        errors: [{ messageId: 'invalid-option' }]
      }))
    });
  });

  it.each(formatters)('should skip unknown options without hiding other literal errors for %s', tag => {
    tester.run('unknown options', rule, {
      valid: [
        'locale="${locale}"',
        'locale="{{ locale }}"',
        'locale="{locale}"',
        'locale="{% locale %}"',
        'locale="en&#45;US"',
        'minimum-fraction-digits="&#50;"',
        'minimum-fraction-digits="101" .minimumFractionDigits=${minimum}',
        'minimum-fraction-digits="101" minimumFractionDigits={minimum}',
        'minimum-fraction-digits="101" [minimumFractionDigits]="minimum"',
        'minimum-fraction-digits="101" [attr.minimum-fraction-digits]="minimum"',
        'minimum-fraction-digits="101" v-bind:minimum-fraction-digits="minimum"',
        'locale="bad_locale" :locale="locale"',
        'locale="bad_locale" v-bind="options"',
        'locale="bad_locale" v-bind:[key]="value"',
        'locale="bad_locale" :[key]="value"',
        'locale="bad_locale" ${attributes}',
        'locale="bad_locale" {...props}',
        'minimum-fraction-digits="3" maximum-fraction-digits="${maximum}"'
      ].map(attributes => `<${tag} ${attributes}>12</${tag}>`),
      invalid: [
        {
          code: `<${tag} locale="bad_locale" .maximumFractionDigits=\${maximum}>12</${tag}>`,
          errors: [{ messageId: 'invalid-option' }]
        },
        {
          code: `<${tag} minimum-fraction-digits="101" maximum-fraction-digits="2">12</${tag}>`,
          errors: [{ messageId: 'invalid-option' }]
        }
      ]
    });
  });

  it('should leave byte enums and unrelated formatters to their existing rules', () => {
    tester.run('separate diagnostics', rule, {
      valid: [
        '<nve-format-bytes display="binary" unit="mb" unit-display="long">12</nve-format-bytes>',
        '<nve-format-bytes unit="invalid">12</nve-format-bytes>',
        '<nve-format-number format-style="invalid">12</nve-format-number>',
        '<nve-format-datetime locale="bad_locale">2026-01-01</nve-format-datetime>',
        '<div locale="bad_locale" minimum-fraction-digits="101">12</div>'
      ],
      invalid: []
    });
  });

  it('should skip JSX property overrides through the recommended config', () => {
    const code =
      'const view = <nve-format-number format-style="currency" formatStyle={style} minimum-fraction-digits="101" minimumFractionDigits={digits}>12</nve-format-number>;';
    const messages = new Linter().verify(code, [elementsHtmlConfig], { filename: 'src/example.tsx' });
    expect(
      messages.filter(message => message.ruleId === '@nvidia-elements/lint/no-invalid-number-format-options')
    ).toEqual([]);
  });

  it.each([
    { filename: 'src/example.html', code: '<nve-format-number format-style="currency">12</nve-format-number>' },
    { filename: 'src/example.ts', code: 'const view = html`<nve-format-bytes locale="en_US">12</nve-format-bytes>`;' },
    { filename: 'src/example.tsx', code: 'const view = <nve-format-number unit="bad">12</nve-format-number>;' },
    {
      filename: 'src/example.md',
      code: '```html\n<nve-format-bytes minimum-fraction-digits="101">12</nve-format-bytes>\n```'
    }
  ])('should report options through the recommended config in $filename', ({ filename, code }) => {
    const messages = new Linter().verify(code, [elementsHtmlConfig], { filename });
    expect(messages).toEqual([
      expect.objectContaining({ ruleId: '@nvidia-elements/lint/no-invalid-number-format-options', severity: 2 })
    ]);
  });
});
