// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noMissingSlottedElements from './no-missing-slotted-elements.js';

const rule = noMissingSlottedElements as unknown as JSRuleDefinition;

describe('noMissingSlottedElements', () => {
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
    expect(noMissingSlottedElements.meta).toBeDefined();
    expect(noMissingSlottedElements.meta.type).toBe('problem');
    expect(noMissingSlottedElements.meta.docs).toBeDefined();
    expect(noMissingSlottedElements.meta.docs.description).toBe('Disallow use of missing slotted elements.');
    expect(noMissingSlottedElements.meta.docs.category).toBe('Best Practice');
    expect(noMissingSlottedElements.meta.docs.recommended).toBe(true);
    expect(noMissingSlottedElements.meta.docs.url).toContain('/docs/lint/');
    expect(noMissingSlottedElements.meta.schema).toBeDefined();
    expect(noMissingSlottedElements.meta.messages).toBeDefined();
    expect(noMissingSlottedElements.meta.messages['unexpected-missing-slotted-element']).toBe(
      'Unexpected use of missing slotted element {{selector}}'
    );
  });

  it('should allow valid use slotted elements', () => {
    tester.run('should allow valid use slotted elements', rule, {
      valid: [
        `<nve-input>
          <label>label</label>
          <input type="text" />
          <nve-control-message>message</nve-control-message>
        </nve-input>`,
        `<nve-input>
          <input type="text" />
        </nve-input>`,
        `<nve-button>
          button
        </nve-button>`,
        `<nve-input>\${}</nve-input>`,
        `<nve-input>{{ }}</nve-input>`,
        `<nve-input>{% %}</nve-input>`,
        `<nve-combobox>
          <input type="search" />
          <datalist></datalist>
        </nve-combobox>`,
        `<nve-combobox>
          <input type="search" />
          <select><option value="a"></option></select>
        </nve-combobox>`
      ],
      invalid: []
    });
  });

  it('should report unexpected use of missing slotted elements', () => {
    tester.run('unexpected use of missing slotted elements', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-input></nve-input>`,
          errors: [{ messageId: 'unexpected-missing-slotted-element', data: { selector: 'input' } }]
        },
        {
          code: `<nve-textarea></nve-textarea>`,
          errors: [{ messageId: 'unexpected-missing-slotted-element', data: { selector: 'textarea' } }]
        },
        {
          code: `<nve-checkbox></nve-checkbox>`,
          errors: [{ messageId: 'unexpected-missing-slotted-element', data: { selector: 'input[type="checkbox"]' } }]
        },
        {
          code: `<nve-radio></nve-radio>`,
          errors: [{ messageId: 'unexpected-missing-slotted-element', data: { selector: 'input[type="radio"]' } }]
        },
        {
          code: `<nve-range></nve-range>`,
          errors: [{ messageId: 'unexpected-missing-slotted-element', data: { selector: 'input[type="range"]' } }]
        },
        {
          code: `<nve-combobox><input type="search" /></nve-combobox>`,
          errors: [{ messageId: 'unexpected-missing-slotted-element', data: { selector: 'datalist, select' } }]
        },
        {
          code: `<nve-combobox><datalist></datalist></nve-combobox>`,
          errors: [{ messageId: 'unexpected-missing-slotted-element', data: { selector: 'input[type="search"]' } }]
        }
      ]
    });
  });

  it('should report custom required elements', () => {
    tester.run('unexpected use of missing slotted elements', rule, {
      valid: [],
      invalid: [
        {
          options: [{ 'nve-card': { required: ['nve-card-content'] } }],
          code: `<nve-card></nve-card>`,
          errors: [{ messageId: 'unexpected-missing-slotted-element', data: { selector: 'nve-card-content' } }]
        }
      ]
    });
  });
});
