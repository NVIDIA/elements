// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noDeprecatedIconNames from './no-deprecated-icon-names.js';

const rule = noDeprecatedIconNames as unknown as JSRuleDefinition;

describe('noDeprecatedIconNames', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      languageOptions: {
        parser: htmlParser,
        parserOptions: {
          frontmatter: true
        }
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noDeprecatedIconNames.meta).toBeDefined();
    expect(noDeprecatedIconNames.meta.type).toBe('problem');
    expect(noDeprecatedIconNames.meta.docs).toBeDefined();
    expect(noDeprecatedIconNames.meta.docs.description).toBe('Disallow use of deprecated icon names.');
    expect(noDeprecatedIconNames.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedIconNames.meta.docs.recommended).toBe(true);
    expect(noDeprecatedIconNames.meta.docs.url).toContain('/docs/lint/');
    expect(noDeprecatedIconNames.meta.schema).toBeDefined();
    expect(noDeprecatedIconNames.meta.messages).toBeDefined();
    expect(noDeprecatedIconNames.meta.messages['unexpected-deprecated-icon-attribute']).toBe(
      'Unexpected use of deprecated icon name of {{deprecated}}. Use {{alternative}} instead.'
    );
  });

  it('should allow valid use of icon name attributes', () => {
    tester.run('should allow valid use of icon name attributes', rule, {
      valid: [
        '<button name="test"></button>',
        '<ui-icon name="test"></ui-icon>',
        '<nve-icon name="person"></nve-icon>',
        `<nve-icon name=${'person'}></nve-icon>`,
        '<nve-icon name></nve-icon>'
      ],
      invalid: []
    });
  });

  it('should report unexpected use of deprecated icon name attribute', () => {
    tester.run('should report unexpected use of deprecated icon name attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-icon name="warning"></nve-icon>',
          errors: [
            {
              messageId: 'unexpected-deprecated-icon-attribute',
              data: { deprecated: 'warning', alternative: 'exclamation-triangle' }
            }
          ]
        }
      ]
    });
  });
});
