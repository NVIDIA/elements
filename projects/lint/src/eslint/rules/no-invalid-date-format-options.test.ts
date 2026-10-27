// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { Linter, RuleTester, type JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import noInvalidDateFormatOptions from './no-invalid-date-format-options.js';

const rule = noInvalidDateFormatOptions as unknown as JSRuleDefinition;
const formatters = ['nve-format-datetime', 'nve-format-relative-time'];

describe('noInvalidDateFormatOptions', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({ languageOptions: { parser: htmlParser } });
  });

  it('should register as a recommended error', () => {
    expect(elementsHtmlConfig.plugins?.['@nvidia-elements/lint']?.rules?.['no-invalid-date-format-options']).toBe(
      noInvalidDateFormatOptions
    );
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-invalid-date-format-options']).toEqual(['error']);
  });

  it.each(formatters)('should allow valid and unsupported well formed locales on %s', tag => {
    tester.run('valid locales', rule, {
      valid: [undefined, 'en-US', 'de-DE', 'en-u-ca-gregory', 'zz-ZZ'].map(
        locale => `<${tag}${locale === undefined ? '' : ` locale="${locale}"`}>2026-01-01</${tag}>`
      ),
      invalid: []
    });
  });

  it.each(formatters)('should reject malformed locales on %s', tag => {
    tester.run('malformed locales', rule, {
      valid: [],
      invalid: ['', 'en_US', 'not_a_locale', 'en-US,de-DE'].map(value => ({
        code: `<${tag} locale="${value}">2026-01-01</${tag}>`,
        errors: [{ messageId: 'invalid-option' }]
      }))
    });
  });

  it.each(formatters)('should skip unknown locale values on %s', tag => {
    tester.run('unknown locales', rule, {
      valid: [
        'locale="${locale}"',
        'locale="{{ locale }}"',
        'locale="{locale}"',
        'locale="{% locale %}"',
        'locale="en&#45;US"',
        'locale="bad_locale" .locale=${locale}',
        'locale="bad_locale" :locale="locale"',
        'locale="bad_locale" [locale]="locale"',
        'locale="bad_locale" [attr.locale]="locale"',
        'locale="bad_locale" v-bind:locale="locale"',
        'locale="bad_locale" v-bind="options"',
        'locale="bad_locale" ${attributes}',
        'locale="bad_locale" {...props}'
      ].map(attributes => `<${tag} ${attributes}>2026-01-01</${tag}>`),
      invalid: []
    });
  });

  it('should allow named zones, aliases, offsets, and omitted or empty zones', () => {
    tester.run('valid time zones', rule, {
      valid: [undefined, '', 'UTC', 'utc', 'America/New_York', 'US/Eastern', '+01:00', '+0100', '+01', '-23:59'].map(
        zone =>
          `<nve-format-datetime${zone === undefined ? '' : ` time-zone="${zone}"`}>2026-01-01</nve-format-datetime>`
      ),
      invalid: []
    });
  });

  it('should reject invalid literal zones and offsets', () => {
    tester.run('invalid time zones', rule, {
      valid: [],
      invalid: ['Invalid/Zone', 'Mars/Olympus', '+24:00', '-24', '+01:60', '+01:00:30', ' UTC '].map(value => ({
        code: `<nve-format-datetime time-zone="${value}">2026-01-01</nve-format-datetime>`,
        errors: [{ messageId: 'invalid-option' }]
      }))
    });
  });

  it('should skip dynamic and encoded time zones', () => {
    tester.run('unknown time zones', rule, {
      valid: [
        'time-zone="${zone}"',
        'time-zone="{{ zone }}"',
        'time-zone="&#85;TC"',
        'time-zone="Invalid/Zone" .timeZone=${zone}',
        'time-zone="Invalid/Zone" timeZone={zone}',
        'time-zone="Invalid/Zone" [timeZone]="zone"',
        'time-zone="Invalid/Zone" [attr.time-zone]="zone"',
        'time-zone="Invalid/Zone" :time-zone="zone"',
        'time-zone="Invalid/Zone" v-bind:time-zone="zone"',
        'time-zone="Invalid/Zone" v-bind="options"',
        'time-zone="Invalid/Zone" {...props}'
      ].map(attributes => `<nve-format-datetime ${attributes}>2026-01-01</nve-format-datetime>`),
      invalid: []
    });
  });

  it('should respect preset precedence over granular date options', () => {
    tester.run('preset precedence', rule, {
      valid: [
        '<nve-format-datetime date-style="short" weekday="long" month="long" time-zone="UTC">2026-01-01</nve-format-datetime>',
        '<nve-format-datetime time-style="short" hour="numeric" time-zone-name="long">2026-01-01</nve-format-datetime>',
        '<nve-format-datetime date-style="${style}" weekday="long">2026-01-01</nve-format-datetime>'
      ],
      invalid: [
        {
          code: '<nve-format-datetime date-style="short" weekday="long" time-zone="Invalid/Zone">2026-01-01</nve-format-datetime>',
          errors: [{ messageId: 'invalid-option' }]
        }
      ]
    });
  });

  it('should validate locale and time zone independently', () => {
    tester.run('independent options', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-format-datetime locale="en_US" time-zone="Invalid/Zone">2026-01-01</nve-format-datetime>',
          errors: [{ messageId: 'invalid-option' }, { messageId: 'invalid-option' }]
        },
        {
          code: '<nve-format-datetime locale="${locale}" time-zone="Invalid/Zone">2026-01-01</nve-format-datetime>',
          errors: [{ messageId: 'invalid-option' }]
        },
        {
          code: '<nve-format-datetime locale="en_US" .timeZone=${zone}>2026-01-01</nve-format-datetime>',
          errors: [{ messageId: 'invalid-option' }]
        }
      ]
    });
  });

  it('should leave enum options and other components to their existing rules', () => {
    tester.run('separate diagnostics', rule, {
      valid: [
        '<nve-format-relative-time format-style="invalid" numeric="invalid" unit="invalid">2026-01-01</nve-format-relative-time>',
        '<nve-format-relative-time time-zone="Invalid/Zone">2026-01-01</nve-format-relative-time>',
        '<nve-format-datetime date-style="invalid">2026-01-01</nve-format-datetime>',
        '<nve-format-number locale="bad_locale">12</nve-format-number>',
        '<div locale="bad_locale" time-zone="Invalid/Zone"></div>'
      ],
      invalid: []
    });
  });

  it('should skip JSX property overrides through the recommended config', () => {
    const code =
      'const view = <nve-format-datetime time-zone="Invalid/Zone" timeZone={zone}>2026-01-01</nve-format-datetime>;';
    const messages = new Linter().verify(code, [elementsHtmlConfig], { filename: 'src/example.tsx' });
    expect(
      messages.filter(message => message.ruleId === '@nvidia-elements/lint/no-invalid-date-format-options')
    ).toEqual([]);
  });

  it.each([
    {
      filename: 'src/example.html',
      code: '<nve-format-datetime time-zone="Invalid/Zone">2026-01-01</nve-format-datetime>'
    },
    {
      filename: 'src/example.ts',
      code: 'const view = html`<nve-format-relative-time locale="en_US">2026-01-01</nve-format-relative-time>`;'
    },
    {
      filename: 'src/example.tsx',
      code: 'const view = <nve-format-datetime time-zone="Invalid/Zone">2026-01-01</nve-format-datetime>;'
    },
    {
      filename: 'src/example.md',
      code: '```html\n<nve-format-relative-time locale="en_US">2026-01-01</nve-format-relative-time>\n```'
    }
  ])('should report through the recommended config in $filename', ({ filename, code }) => {
    expect(new Linter().verify(code, [elementsHtmlConfig], { filename })).toEqual([
      expect.objectContaining({
        ruleId: '@nvidia-elements/lint/no-invalid-date-format-options',
        messageId: 'invalid-option',
        severity: 2
      })
    ]);
  });
});
