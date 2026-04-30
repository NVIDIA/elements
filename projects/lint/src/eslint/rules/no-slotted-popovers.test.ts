// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noSlottedPopovers from './no-slotted-popovers.js';

const rule = noSlottedPopovers as unknown as JSRuleDefinition;

describe('noSlottedPopovers', () => {
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
    expect(noSlottedPopovers.meta).toBeDefined();
    expect(noSlottedPopovers.meta.type).toBe('problem');
    expect(noSlottedPopovers.meta.docs).toBeDefined();
    expect(noSlottedPopovers.meta.docs.description).toBe('Disallow the slot attribute on popover elements.');
    expect(noSlottedPopovers.meta.docs.category).toBe('Best Practice');
    expect(noSlottedPopovers.meta.docs.recommended).toBe(true);
    expect(noSlottedPopovers.meta.docs.url).toContain('/docs/lint/');
    expect(noSlottedPopovers.meta.schema).toBeDefined();
    expect(noSlottedPopovers.meta.messages).toBeDefined();
    expect(noSlottedPopovers.meta.messages['no-slotted-popover']).toContain('Unexpected slot attribute');
  });

  it('should allow popover elements without a slot attribute', () => {
    tester.run('should allow popover elements without a slot attribute', rule, {
      valid: [
        '<nve-tooltip></nve-tooltip>',
        '<nve-dialog id="d"></nve-dialog>',
        '<nve-drawer><div>content</div></nve-drawer>',
        '<nve-toast id="t"></nve-toast>',
        '<nve-dropdown></nve-dropdown>'
      ],
      invalid: []
    });
  });

  it('should allow non-popover elements with a slot attribute', () => {
    tester.run('should allow non-popover elements with a slot attribute', rule, {
      valid: [
        '<div slot="header"></div>',
        '<span slot=""></span>',
        '<nve-button slot="actions"></nve-button>',
        '<nve-icon slot="prefix" name="check"></nve-icon>',
        '<section slot="${name}"></section>'
      ],
      invalid: []
    });
  });

  it('should report a static slot value on a popover element', () => {
    tester.run('should report a static slot value on a popover element', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tooltip slot="header"></nve-tooltip>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-tooltip' } }]
        }
      ]
    });
  });

  it('should report an empty slot value on a popover element', () => {
    tester.run('should report an empty slot value on a popover element', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tooltip slot=""></nve-tooltip>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-tooltip' } }]
        }
      ]
    });
  });

  it('should report a whitespace-only slot value on a popover element', () => {
    tester.run('should report a whitespace-only slot value on a popover element', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tooltip slot="   "></nve-tooltip>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-tooltip' } }]
        }
      ]
    });
  });

  it('should report template-bound slot values on popover elements', () => {
    tester.run('should report template-bound slot values on popover elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tooltip slot="${name}"></nve-tooltip>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-tooltip' } }]
        },
        {
          code: '<nve-dialog slot="{{name}}"></nve-dialog>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-dialog' } }]
        }
      ]
    });
  });

  it('should report a bare slot attribute on a popover element', () => {
    tester.run('should report a bare slot attribute on a popover element', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tooltip slot></nve-tooltip>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-tooltip' } }]
        }
      ]
    });
  });

  it('should report slot on every popover-behavior element', () => {
    tester.run('should report slot on every popover-behavior element', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-dialog slot="content"></nve-dialog>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-dialog' } }]
        },
        {
          code: '<nve-drawer slot="aside"></nve-drawer>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-drawer' } }]
        },
        {
          code: '<nve-dropdown slot="menu"></nve-dropdown>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-dropdown' } }]
        },
        {
          code: '<nve-toast slot="notifications"></nve-toast>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-toast' } }]
        },
        {
          code: '<nve-toggletip slot="hint"></nve-toggletip>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-toggletip' } }]
        },
        {
          code: '<nve-notification slot="alerts"></nve-notification>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-notification' } }]
        },
        {
          code: '<nve-notification-group slot="alerts"></nve-notification-group>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-notification-group' } }]
        },
        {
          code: '<nve-page-loader slot="overlay"></nve-page-loader>',
          errors: [{ messageId: 'no-slotted-popover', data: { tag: 'nve-page-loader' } }]
        }
      ]
    });
  });

  it('should not report nested popovers without slot in a slotted wrapper', () => {
    tester.run('should not report nested popovers without slot in a slotted wrapper', rule, {
      valid: ['<div slot="content"><nve-tooltip></nve-tooltip></div>'],
      invalid: []
    });
  });
});
