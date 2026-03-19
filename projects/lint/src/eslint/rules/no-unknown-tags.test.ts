// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noUnknownTags from './no-unknown-tags.js';

const rule = noUnknownTags as unknown as JSRuleDefinition;

describe('noUnknownTags', () => {
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
    expect(noUnknownTags.meta).toBeDefined();
    expect(noUnknownTags.meta.type).toBe('problem');
    expect(noUnknownTags.meta.docs).toBeDefined();
    expect(noUnknownTags.meta.docs.description).toBe('Disallow use of unknown <nve-*> tags.');
    expect(noUnknownTags.meta.docs.category).toBe('Best Practice');
    expect(noUnknownTags.meta.docs.recommended).toBe(true);
    expect(noUnknownTags.meta.docs.url).toBe('https://NVIDIA.github.io/elements/docs/lint/');
    expect(noUnknownTags.meta.schema).toBeDefined();
    expect(noUnknownTags.meta.messages).toBeDefined();
    expect(noUnknownTags.meta.messages['unknown-tag']).toBe('Unexpected use of unknown tag <{{tag}}>');
  });

  it('should allow valid use of known nve-* tags', () => {
    tester.run('should allow valid use of known nve-* tags', rule, {
      valid: [
        `<nve-button>Click me</nve-button>`,
        `<nve-badge>Badge</nve-badge>`,
        `<nve-input><input type="text" /></nve-input>`,
        `<nve-card><nve-card-content>Content</nve-card-content></nve-card>`
      ],
      invalid: []
    });
  });

  it('should allow non-nve tags', () => {
    tester.run('should allow non-nve tags', rule, {
      valid: [
        `<div>content</div>`,
        `<span>text</span>`,
        `<custom-element>custom</custom-element>`,
        `<my-component>component</my-component>`,
        `<button>button</button>`
      ],
      invalid: []
    });
  });

  it('should report unknown nve-* tags', () => {
    tester.run('should report unknown nve-* tags', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-unknown-element>content</nve-unknown-element>`,
          errors: [{ messageId: 'unknown-tag', data: { tag: 'nve-unknown-element' } }]
        },
        {
          code: `<nve-fake-component></nve-fake-component>`,
          errors: [{ messageId: 'unknown-tag', data: { tag: 'nve-fake-component' } }]
        },
        {
          code: `<nve-not-real>text</nve-not-real>`,
          errors: [{ messageId: 'unknown-tag', data: { tag: 'nve-not-real' } }]
        }
      ]
    });
  });

  it('should report multiple unknown tags in same template', () => {
    tester.run('should report multiple unknown tags', rule, {
      valid: [],
      invalid: [
        {
          code: `<div>
            <nve-invalid-one>one</nve-invalid-one>
            <nve-invalid-two>two</nve-invalid-two>
          </div>`,
          errors: [
            { messageId: 'unknown-tag', data: { tag: 'nve-invalid-one' } },
            { messageId: 'unknown-tag', data: { tag: 'nve-invalid-two' } }
          ]
        }
      ]
    });
  });
});
