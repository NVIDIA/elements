// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noUnexpectedAttributeValue from './no-unexpected-attribute-value.js';

const rule = noUnexpectedAttributeValue as unknown as JSRuleDefinition;

describe('noUnexpectedAttributeValue', () => {
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
    expect(noUnexpectedAttributeValue.meta).toBeDefined();
    expect(noUnexpectedAttributeValue.meta.type).toBe('problem');
    expect(noUnexpectedAttributeValue.meta.hasSuggestions).toBe(true);
    expect(noUnexpectedAttributeValue.meta.docs).toBeDefined();
    expect(noUnexpectedAttributeValue.meta.docs.description).toBe(
      'Disallow use of invalid attribute values for nve-* elements.'
    );
    expect(noUnexpectedAttributeValue.meta.docs.category).toBe('Best Practice');
    expect(noUnexpectedAttributeValue.meta.docs.recommended).toBe(true);
    expect(noUnexpectedAttributeValue.meta.docs.url).toContain('/docs/lint/');
    expect(noUnexpectedAttributeValue.meta.schema).toBeDefined();
    expect(noUnexpectedAttributeValue.meta.messages).toBeDefined();
    expect(noUnexpectedAttributeValue.meta.messages['no-unexpected-attribute-value']).toBe(
      'Unexpected value "{{value}}" for attribute "{{attribute}}" on <{{tagName}}>. Available values: {{validValues}}'
    );
    expect(noUnexpectedAttributeValue.meta.messages['unexpected-attribute-value-alternative']).toBe(
      'Unexpected value "{{value}}" for attribute "{{attribute}}" on <{{tagName}}>. Did you mean "{{alternative}}"?'
    );
    expect(noUnexpectedAttributeValue.meta.messages['suggest-replace-attribute-value']).toBe(
      'Replace "{{value}}" with "{{alternative}}"'
    );
  });

  it('should allow valid enum attribute values', () => {
    tester.run('should allow valid enum attribute values', rule, {
      valid: [
        `<nve-badge status="accent">Badge</nve-badge>`,
        `<nve-badge status="warning">Badge</nve-badge>`,
        `<nve-badge status="success">Badge</nve-badge>`,
        `<nve-badge status="danger">Badge</nve-badge>`
      ],
      invalid: []
    });
  });

  it('should allow non-enum attribute values', () => {
    tester.run('should allow non-enum attribute values', rule, {
      valid: [
        `<nve-button>Button</nve-button>`,
        `<nve-icon name="check"></nve-icon>`,
        `<nve-badge>Badge</nve-badge>`,
        `<nve-sparkline data="[14, 18, 17, 20, 19, 24, 21]"></nve-sparkline>`
      ],
      invalid: []
    });
  });

  it('should allow valid attribute values', () => {
    tester.run('should allow valid attribute values', rule, {
      valid: [
        `<nve-button status="success">button</nve-button>`,
        `<nve-icon name="check"></nve-icon>`,
        `<nve-tooltip anchor="top" trigger="btn">tooltip</nve-tooltip>`,
        `<nve-toggletip anchor="top" trigger="btn">toggletip</nve-toggletip>`
      ],
      invalid: []
    });
  });

  it('should allow template bindings in attribute values', () => {
    tester.run('should allow template bindings', rule, {
      valid: [
        `<nve-badge status="\${status}">Badge</nve-badge>`,
        `<nve-badge status="{{status}}">Badge</nve-badge>`,
        `<nve-badge status="{status}">Badge</nve-badge>`,
        `<nve-badge status="{% status %}">Badge</nve-badge>`
      ],
      invalid: []
    });
  });

  it('should ignore non-nve elements', () => {
    tester.run('should ignore non-nve elements', rule, {
      valid: [
        `<div status="invalid">content</div>`,
        `<custom-element status="anything">content</custom-element>`,
        `<span data-status="value">text</span>`
      ],
      invalid: []
    });
  });

  it('should report invalid enum attribute values', () => {
    tester.run('should report invalid enum attribute values', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-badge status="invalid">Badge</nve-badge>`,
          errors: [
            {
              messageId: 'no-unexpected-attribute-value',
              data: {
                tagName: 'nve-badge',
                attribute: 'status',
                value: 'invalid',
                validValues:
                  '"accent", "danger", "failed", "finished", "ignored", "pending", "queued", "restarting", "running", "scheduled", "starting", "stopping", "success", "unknown", "warning"'
              }
            }
          ]
        }
      ]
    });
  });

  it('should suggest alternatives for similar values', () => {
    tester.run('should suggest alternatives for similar values', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-badge status="Accent">Badge</nve-badge>`,
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { tagName: 'nve-badge', attribute: 'status', value: 'Accent', alternative: 'accent' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'Accent', alternative: 'accent' },
                  output: `<nve-badge status="accent">Badge</nve-badge>`
                }
              ]
            }
          ]
        }
      ]
    });
  });
});
