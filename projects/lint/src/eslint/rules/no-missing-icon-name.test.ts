// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noMissingIconName from './no-missing-icon-name.js';

const rule = noMissingIconName as unknown as JSRuleDefinition;

describe('noMissingIconName', () => {
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
    expect(noMissingIconName.meta).toBeDefined();
    expect(noMissingIconName.meta.type).toBe('problem');
    expect(noMissingIconName.meta.docs).toBeDefined();
    expect(noMissingIconName.meta.docs.description).toBe('Require icon elements to have an icon name attribute.');
    expect(noMissingIconName.meta.docs.category).toBe('Best Practice');
    expect(noMissingIconName.meta.docs.recommended).toBe(true);
    expect(noMissingIconName.meta.docs.url).toBe('https://NVIDIA.github.io/elements/docs/lint/');
    expect(noMissingIconName.meta.schema).toBeDefined();
    expect(noMissingIconName.meta.messages).toBeDefined();
    expect(noMissingIconName.meta.messages['missing-icon-name']).toBe(
      '<{{element}}> is missing an icon name. Add a {{attribute}} attribute to specify which icon to display.'
    );
  });

  it('should allow nve-icon with a name attribute', () => {
    tester.run('should allow nve-icon with a name attribute', rule, {
      valid: [
        '<nve-icon name="person"></nve-icon>',
        '<nve-icon name="add"></nve-icon>',
        '<nve-icon name="chevron" direction="down"></nve-icon>'
      ],
      invalid: []
    });
  });

  it('should allow non-icon elements without a name attribute', () => {
    tester.run('should allow non-icon elements without a name attribute', rule, {
      valid: ['<button></button>', '<nve-button>click</nve-button>', '<div></div>', '<span></span>'],
      invalid: []
    });
  });

  it('should allow icon elements with data binding syntax', () => {
    tester.run('should allow icon elements with data binding syntax', rule, {
      valid: [
        '<nve-icon name="${iconName}"></nve-icon>',
        '<nve-icon name="{{iconName}}"></nve-icon>',
        '<nve-icon name="{iconName}"></nve-icon>',
        '<nve-icon [name]="iconName"></nve-icon>',
        '<nve-icon .name="iconName"></nve-icon>',
        '<nve-icon-button icon-name="${iconName}"></nve-icon-button>',
        '<nve-icon-button icon-name="{{iconName}}"></nve-icon-button>',
        '<nve-icon-button [icon-name]="iconName"></nve-icon-button>',
        '<nve-icon-button [iconName]="iconName"></nve-icon-button>',
        '<nve-icon-button .iconName="iconName"></nve-icon-button>'
      ],
      invalid: []
    });
  });

  it('should allow nve-icon-button with icon-name attribute', () => {
    tester.run('should allow nve-icon-button with icon-name attribute', rule, {
      valid: [
        '<nve-icon-button icon-name="menu"></nve-icon-button>',
        '<nve-icon-button icon-name="search" size="sm"></nve-icon-button>'
      ],
      invalid: []
    });
  });

  it('should allow nve-icon-button with slotted content instead of icon-name', () => {
    tester.run('should allow nve-icon-button with slotted content', rule, {
      valid: [
        '<nve-icon-button>EL</nve-icon-button>',
        '<nve-icon-button><svg></svg></nve-icon-button>',
        '<nve-icon-button><img src="icon.png" /></nve-icon-button>'
      ],
      invalid: []
    });
  });

  it('should report nve-icon without a name attribute', () => {
    tester.run('should report nve-icon without a name attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-icon></nve-icon>',
          errors: [
            {
              messageId: 'missing-icon-name',
              data: { element: 'nve-icon', attribute: 'name' }
            }
          ]
        }
      ]
    });
  });

  it('should report nve-icon with an empty name attribute', () => {
    tester.run('should report nve-icon with an empty name attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-icon name></nve-icon>',
          errors: [
            {
              messageId: 'missing-icon-name',
              data: { element: 'nve-icon', attribute: 'name' }
            }
          ]
        },
        {
          code: '<nve-icon name=""></nve-icon>',
          errors: [
            {
              messageId: 'missing-icon-name',
              data: { element: 'nve-icon', attribute: 'name' }
            }
          ]
        }
      ]
    });
  });

  it('should report nve-icon-button without icon-name or slotted content', () => {
    tester.run('should report nve-icon-button without icon-name or content', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-icon-button></nve-icon-button>',
          errors: [
            {
              messageId: 'missing-icon-name',
              data: { element: 'nve-icon-button', attribute: 'icon-name' }
            }
          ]
        }
      ]
    });
  });
});
