// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noMisprefixedTags from './no-misprefixed-tags.js';

const rule = noMisprefixedTags as unknown as JSRuleDefinition;

describe('noMisprefixedTags', () => {
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
    expect(noMisprefixedTags.meta).toBeDefined();
    expect(noMisprefixedTags.meta.type).toBe('problem');
    expect(noMisprefixedTags.meta.fixable).toBe('code');
    expect(noMisprefixedTags.meta.docs).toBeDefined();
    expect(noMisprefixedTags.meta.docs.description).toBe(
      'Disallow misprefixed (nv-*) Elements tags that resolve to a known (nve-*) element.'
    );
    expect(noMisprefixedTags.meta.docs.category).toBe('Best Practice');
    expect(noMisprefixedTags.meta.docs.recommended).toBe(true);
    expect(noMisprefixedTags.meta.docs.url).toContain('/docs/lint/');
    expect(noMisprefixedTags.meta.schema).toBeDefined();
    expect(noMisprefixedTags.meta.messages).toBeDefined();
    expect(noMisprefixedTags.meta.messages['misprefixed-tag']).toBe(
      'Unexpected tag prefix in <{{tag}}>. Did you mean <{{replacement}}>?'
    );
  });

  it('should allow correct nve-* tags and unrelated elements', () => {
    tester.run('allow correct and unrelated tags', rule, {
      valid: [
        // Correct prefix is handled by no-unknown-tags, not this rule.
        `<nve-button>Click me</nve-button>`,
        `<nve-card><nve-card-content>Content</nve-card-content></nve-card>`,
        // Native and unrelated custom elements.
        `<div>content</div>`,
        `<button>button</button>`,
        `<my-button>component</my-button>`,
        `<custom-card>card</custom-card>`,
        // Prefix is too far from "nve" (edit distance > 1) to be a typo.
        `<one-card>card</one-card>`,
        // v0 deprecated prefix is handled by no-deprecated-tags.
        `<mlv-button>button</mlv-button>`
      ],
      invalid: []
    });
  });

  it('should allow near-miss prefixes when the corrected tag is not a known element', () => {
    tester.run('allow near-miss prefixes without a known element', rule, {
      valid: [
        `<nv-frobnicate>content</nv-frobnicate>`,
        `<ne-widget>content</ne-widget>`,
        `<nv-not-real></nv-not-real>`
      ],
      invalid: []
    });
  });

  it('should report and fix a missing letter in the prefix', () => {
    tester.run('missing letter in prefix', rule, {
      valid: [],
      invalid: [
        {
          code: `<nv-button>Click me</nv-button>`,
          output: `<nve-button>Click me</nve-button>`,
          errors: [{ messageId: 'misprefixed-tag', data: { tag: 'nv-button', replacement: 'nve-button' } }]
        },
        {
          code: `<ne-card>card</ne-card>`,
          output: `<nve-card>card</nve-card>`,
          errors: [{ messageId: 'misprefixed-tag', data: { tag: 'ne-card', replacement: 'nve-card' } }]
        },
        {
          code: `<ve-input></ve-input>`,
          output: `<nve-input></nve-input>`,
          errors: [{ messageId: 'misprefixed-tag', data: { tag: 've-input', replacement: 'nve-input' } }]
        }
      ]
    });
  });

  it('should ignore prefixes that are not exactly two characters', () => {
    tester.run('ignore non-two-character prefixes', rule, {
      valid: [
        // Three-or-more-character prefixes are ignored even when close to "nve".
        `<nvd-button>x</nvd-button>`,
        `<nev-badge>new</nev-badge>`,
        `<nvee-button>x</nvee-button>`,
        // Single-character prefixes are ignored.
        `<n-button>x</n-button>`
      ],
      invalid: []
    });
  });

  it('should report and fix multi-segment tag names', () => {
    tester.run('multi-segment tag names', rule, {
      valid: [],
      invalid: [
        {
          code: `<nv-page-panel>content</nv-page-panel>`,
          output: `<nve-page-panel>content</nve-page-panel>`,
          errors: [{ messageId: 'misprefixed-tag', data: { tag: 'nv-page-panel', replacement: 'nve-page-panel' } }]
        }
      ]
    });
  });

  it('should report and fix self-closing tags without a closing tag', () => {
    tester.run('self-closing tags', rule, {
      valid: [],
      invalid: [
        {
          code: `<nv-icon name="star" />`,
          output: `<nve-icon name="star" />`,
          errors: [{ messageId: 'misprefixed-tag', data: { tag: 'nv-icon', replacement: 'nve-icon' } }]
        }
      ]
    });
  });

  it('should report multiple misprefixed tags in the same template', () => {
    tester.run('multiple misprefixed tags', rule, {
      valid: [],
      invalid: [
        {
          code: `<div>
            <nv-button>one</nv-button>
            <ne-card>two</ne-card>
          </div>`,
          output: `<div>
            <nve-button>one</nve-button>
            <nve-card>two</nve-card>
          </div>`,
          errors: [
            { messageId: 'misprefixed-tag', data: { tag: 'nv-button', replacement: 'nve-button' } },
            { messageId: 'misprefixed-tag', data: { tag: 'ne-card', replacement: 'nve-card' } }
          ]
        }
      ]
    });
  });
});
