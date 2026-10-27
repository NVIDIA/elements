// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { Linter, RuleTester, type JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import { PARENT_ELEMENT_CONTRACTS } from '../internals/parent-elements.js';
import noInvalidParentElements from './no-invalid-parent-elements.js';

const rule = noInvalidParentElements as unknown as JSRuleDefinition;

describe('noInvalidParentElements', () => {
  let tester: RuleTester;
  beforeEach(() => {
    tester = new RuleTester({ languageOptions: { parser: htmlParser } });
  });

  it('should register as a recommended error', () => {
    expect(elementsHtmlConfig.plugins?.['@nvidia-elements/lint']?.rules?.['no-invalid-parent-elements']).toBe(
      noInvalidParentElements
    );
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-invalid-parent-elements']).toEqual(['error']);
  });

  it.each(Object.entries(PARENT_ELEMENT_CONTRACTS))('should enforce the parent contract for %s', (tagName, parents) => {
    tester.run('direct parent contracts', rule, {
      valid: parents.map(parent => `<${parent}><${tagName}></${tagName}></${parent}>`),
      invalid: [
        {
          code: `<div><${tagName}></${tagName}></div>`,
          errors: [
            {
              messageId: 'invalid-parent-element',
              data: { element: tagName, parent: 'div', parents: parents.map(parent => `<${parent}>`).join(' or ') }
            }
          ]
        }
      ]
    });
  });

  it('should require the direct parent even when an allowed ancestor or slot exists', () => {
    tester.run('direct ownership', rule, {
      valid: ['<nve-tree-node><nve-tree-node slot="nodes"></nve-tree-node></nve-tree-node>'],
      invalid: [
        {
          code: '<nve-menu><div><nve-menu-item>Item</nve-menu-item></div></nve-menu>',
          errors: [{ messageId: 'invalid-parent-element' }]
        },
        {
          code: '<div><nve-dialog-header slot="header">Title</nve-dialog-header></div>',
          errors: [{ messageId: 'invalid-parent-element' }]
        },
        {
          code: '<div><nve-card-header .slot=${slot}>Title</nve-card-header></div>',
          errors: [{ messageId: 'invalid-parent-element' }]
        },
        { code: '<body><nve-menu-item>Item</nve-menu-item></body>', errors: [{ messageId: 'invalid-parent-element' }] }
      ]
    });
  });

  it('should traverse Angular containers that do not render an element', () => {
    tester.run('transparent containers', rule, {
      valid: [
        '<nve-menu><ng-container><ng-container><nve-menu-item>Item</nve-menu-item></ng-container></ng-container></nve-menu>'
      ],
      invalid: [
        {
          code: '<div><ng-container><nve-menu-item>Item</nve-menu-item></ng-container></div>',
          errors: [{ messageId: 'invalid-parent-element' }]
        }
      ]
    });
  });

  it('should leave external placement and opaque wrappers unchecked', () => {
    tester.run('unknown parents', rule, {
      valid: [
        '<nve-menu-item>Item</nve-menu-item>',
        '<template><nve-menu-item>Item</nve-menu-item></template>',
        '<ng-template><nve-menu-item>Item</nve-menu-item></ng-template>',
        '<slot><nve-menu-item>Item</nve-menu-item></slot>',
        '<component :is="owner"><nve-menu-item>Item</nve-menu-item></component>',
        '<app-menu><nve-menu-item>Item</nve-menu-item></app-menu>',
        '<Owner><nve-menu-item>Item</nve-menu-item></Owner>',
        {
          filename: 'src/example.ts',
          code: 'const renderItem = item => html`<nve-menu-item>${item.label}</nve-menu-item>`;'
        },
        {
          filename: 'src/example.tsx',
          code: 'const view = <Owner><nve-menu-item>Item</nve-menu-item></Owner>;'
        },
        { filename: 'src/example.md', code: 'Use `<nve-menu-item>` inside a menu.' },
        '<div><nve-card>Content</nve-card></div>'
      ],
      invalid: []
    });
  });

  it.each([
    { filename: 'src/example.html', code: '<div><nve-menu-item>Item</nve-menu-item></div>' },
    { filename: 'src/example.ts', code: 'const view = html`<div><nve-menu-item>Item</nve-menu-item></div>`;' },
    { filename: 'src/example.tsx', code: 'const view = <div><nve-menu-item>Item</nve-menu-item></div>;' },
    { filename: 'src/example.md', code: '```html\n<div><nve-menu-item>Item</nve-menu-item></div>\n```' }
  ])('should report parent errors through the recommended config in $filename', ({ filename, code }) => {
    const messages = new Linter().verify(code, [elementsHtmlConfig], { filename });
    expect(messages).toEqual([
      expect.objectContaining({
        ruleId: '@nvidia-elements/lint/no-invalid-parent-elements',
        messageId: 'invalid-parent-element',
        severity: 2
      })
    ]);
  });
});
