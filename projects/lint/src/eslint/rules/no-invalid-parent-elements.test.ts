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

  it('should reject grids nested through cells and other wrappers regardless of container styling', () => {
    tester.run('nested grids', rule, {
      valid: [
        '<nve-grid></nve-grid>',
        '<div><nve-grid></nve-grid><nve-grid></nve-grid></div>',
        '<nve-card-content><nve-grid container="flat"></nve-grid></nve-card-content>',
        '<nve-grid><template><nve-grid></nve-grid></template></nve-grid>',
        '<nve-grid><ng-template><nve-grid></nve-grid></ng-template></nve-grid>',
        { filename: 'src/example.md', code: 'Use `<nve-grid>` for data.' },
        { filename: 'src/example.md', code: 'Avoid `<nve-grid><nve-grid></nve-grid></nve-grid>` nesting.' }
      ],
      invalid: [
        ...[
          '<nve-grid><nve-grid></nve-grid></nve-grid>',
          '<nve-grid><div><nve-grid></nve-grid></div></nve-grid>',
          '<nve-grid><nve-grid-row><nve-grid-cell><nve-grid></nve-grid></nve-grid-cell></nve-grid-row></nve-grid>',
          '<nve-grid><nve-virtual-list><nve-grid></nve-grid></nve-virtual-list></nve-grid>',
          '<nve-grid><nve-grid container="flat"></nve-grid></nve-grid>',
          '<nve-grid><app-content><nve-grid></nve-grid></app-content></nve-grid>',
          '<NVE-GRID><div><NVE-GRID></NVE-GRID></div></NVE-GRID>',
          '<template><nve-grid><nve-grid></nve-grid></nve-grid></template>'
        ].map(code => ({
          code,
          errors: [{ messageId: 'invalid-ancestor-element', data: { element: 'nve-grid', ancestor: 'nve-grid' } }]
        })),
        {
          code: '<nve-grid><nve-grid><nve-grid></nve-grid></nve-grid></nve-grid>',
          errors: [{ messageId: 'invalid-ancestor-element' }, { messageId: 'invalid-ancestor-element' }]
        }
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

  it.each([
    { filename: 'src/example.html', code: '<nve-grid><div><nve-grid></nve-grid></div></nve-grid>' },
    { filename: 'src/example.ts', code: 'const view = html`<nve-grid><div><nve-grid></nve-grid></div></nve-grid>`;' },
    { filename: 'src/example.tsx', code: 'const view = <nve-grid><div><nve-grid></nve-grid></div></nve-grid>;' },
    { filename: 'src/example.md', code: '```html\n<nve-grid><div><nve-grid></nve-grid></div></nve-grid>\n```' }
  ])('should report nested grids through the recommended config in $filename', ({ filename, code }) => {
    const messages = new Linter().verify(code, [elementsHtmlConfig], { filename });
    expect(messages.filter(message => message.ruleId === '@nvidia-elements/lint/no-invalid-parent-elements')).toEqual([
      expect.objectContaining({ messageId: 'invalid-ancestor-element', severity: 2 })
    ]);
  });
});
