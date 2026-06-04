// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noDeprecatedPopoverAttributes from './no-deprecated-popover-attributes.js';

const rule = noDeprecatedPopoverAttributes as unknown as JSRuleDefinition;
const POPOVER_API_REPLACEMENT = 'native HTML popover API';
const createDeprecatedPopoverAttributeError = (attribute: string, replacement = POPOVER_API_REPLACEMENT) => ({
  messageId: 'unexpected-deprecated-popover-attribute',
  data: { attribute, replacement }
});

describe('noDeprecatedPopoverAttributes', () => {
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
    expect(noDeprecatedPopoverAttributes.meta).toBeDefined();
    expect(noDeprecatedPopoverAttributes.meta.type).toBe('problem');
    expect(noDeprecatedPopoverAttributes.meta.docs).toBeDefined();
    expect(noDeprecatedPopoverAttributes.meta.docs.description).toBe('Disallow use of deprecated popover attributes.');
    expect(noDeprecatedPopoverAttributes.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedPopoverAttributes.meta.docs.recommended).toBe(true);
    expect(noDeprecatedPopoverAttributes.meta.docs.url).toContain('/docs/lint/');
    expect(noDeprecatedPopoverAttributes.meta.schema).toBeDefined();
    expect(noDeprecatedPopoverAttributes.meta.messages).toBeDefined();
    expect(noDeprecatedPopoverAttributes.meta.messages['unexpected-deprecated-popover-attribute']).toBe(
      'Unexpected use of deprecated popover attribute {{attribute}}. Use {{replacement}} instead.'
    );
  });

  it('should allow valid use of popover related attributes', () => {
    tester.run('unexpected use of deprecated attribute', rule, {
      valid: ['<div></div>', '<nve-dialog></nve-dialog>', '<ui-dialog trigger behavior-trigger></ui-dialog>'],
      invalid: []
    });
  });

  it('should report unexpected use of deprecated popover attributes', () => {
    tester.run('unexpected use of deprecated attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-dialog trigger></nve-dialog>',
          errors: [createDeprecatedPopoverAttributeError('trigger')]
        },
        {
          code: '<nve-dialog behavior-trigger></nve-dialog>',
          errors: [createDeprecatedPopoverAttributeError('behavior-trigger')]
        },
        {
          code: '<nve-tooltip trigger></nve-tooltip>',
          errors: [createDeprecatedPopoverAttributeError('trigger')]
        },
        {
          code: '<nve-tooltip behavior-trigger></nve-tooltip>',
          errors: [createDeprecatedPopoverAttributeError('behavior-trigger')]
        },
        {
          code: '<nve-tooltip open-delay="500"></nve-tooltip>',
          errors: [createDeprecatedPopoverAttributeError('open-delay', '`interest-delay-start` CSS property')]
        },
        {
          code: '<nve-toggletip trigger></nve-toggletip>',
          errors: [createDeprecatedPopoverAttributeError('trigger')]
        },
        {
          code: '<nve-toggletip behavior-trigger></nve-toggletip>',
          errors: [createDeprecatedPopoverAttributeError('behavior-trigger')]
        },
        {
          code: '<nve-toast trigger></nve-toast>',
          errors: [createDeprecatedPopoverAttributeError('trigger')]
        },
        {
          code: '<nve-toast behavior-trigger></nve-toast>',
          errors: [createDeprecatedPopoverAttributeError('behavior-trigger')]
        },
        {
          code: '<nve-drawer trigger></nve-drawer>',
          errors: [createDeprecatedPopoverAttributeError('trigger')]
        },
        {
          code: '<nve-drawer behavior-trigger></nve-drawer>',
          errors: [createDeprecatedPopoverAttributeError('behavior-trigger')]
        },
        {
          code: '<nve-dropdown trigger></nve-dropdown>',
          errors: [createDeprecatedPopoverAttributeError('trigger')]
        },
        {
          code: '<nve-dropdown behavior-trigger></nve-dropdown>',
          errors: [createDeprecatedPopoverAttributeError('behavior-trigger')]
        },
        {
          code: '<nve-notification trigger></nve-notification>',
          errors: [createDeprecatedPopoverAttributeError('trigger')]
        },
        {
          code: '<nve-notification behavior-trigger></nve-notification>',
          errors: [createDeprecatedPopoverAttributeError('behavior-trigger')]
        }
      ]
    });
  });
});
