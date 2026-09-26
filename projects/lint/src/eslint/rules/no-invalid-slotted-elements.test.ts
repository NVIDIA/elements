// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import { SLOTTED_ELEMENT_CONTRACTS } from '../internals/slotted-elements.js';
import noInvalidSlottedElements from './no-invalid-slotted-elements.js';

const rule = noInvalidSlottedElements as unknown as JSRuleDefinition;

function childMarkup(tagName: string): string {
  return tagName === 'input' ? '<input />' : `<${tagName}></${tagName}>`;
}

describe('noInvalidSlottedElements', () => {
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
    expect(noInvalidSlottedElements.meta.type).toBe('problem');
    expect(noInvalidSlottedElements.meta.docs.description).toBe(
      'Disallow invalid direct slotted elements in Elements components.'
    );
    expect(noInvalidSlottedElements.meta.docs.category).toBe('Best Practice');
    expect(noInvalidSlottedElements.meta.docs.recommended).toBe(true);
    expect(noInvalidSlottedElements.meta.docs.url).toContain('/docs/lint/');
    expect(noInvalidSlottedElements.meta.schema).toEqual([]);
    expect(noInvalidSlottedElements.meta.messages['invalid-slotted-element']).toBe(
      'Invalid direct child <{{child}}> in <{{parent}}>. Allowed default-slot elements: {{allowed}}.'
    );
  });

  it('should register the rule as a recommended error', () => {
    const plugin = elementsHtmlConfig.plugins?.['@nvidia-elements/lint'];

    expect(plugin?.rules?.['no-invalid-slotted-elements']).toBe(noInvalidSlottedElements);
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-invalid-slotted-elements']).toEqual(['error']);
  });

  it('should allow every declared child relationship', () => {
    const valid = Object.entries(SLOTTED_ELEMENT_CONTRACTS).flatMap(([parent, children]) =>
      children.map(child => `<${parent}>${childMarkup(child)}</${parent}>`)
    );

    tester.run('declared child relationships', rule, { valid, invalid: [] });
  });

  it('should allow content that cannot be proven invalid', () => {
    tester.run('conservative exceptions', rule, {
      valid: [
        '<nve-grid><div slot="footer"></div></nve-grid>',
        '<nve-tabs-group><section slot="overview"></section></nve-tabs-group>',
        '<nve-grid><div slot=${slotName}></div></nve-grid>',
        '<nve-grid><div .slot=${slotName}></div></nve-grid>',
        '<nve-grid><template><div></div></template></nve-grid>',
        '<nve-grid><lit-virtualizer scroller></lit-virtualizer></nve-grid>',
        '<nve-grid><ng-container><nve-grid-row></nve-grid-row></ng-container></nve-grid>',
        '<nve-button-group><nve-media-seek-button></nve-media-seek-button><nve-media-pause-button></nve-media-pause-button></nve-button-group>',
        '<nve-card><div></div></nve-card>',
        '<nve-grid>dynamic rows</nve-grid>',
        {
          filename: 'documentation.md',
          code: 'Use `<nve-grid>` with `<div>` only when documenting an invalid example.'
        }
      ],
      invalid: []
    });
  });

  it('should report invalid direct default-slot children', () => {
    tester.run('invalid direct children', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-grid><table></table></nve-grid>',
          errors: [
            {
              messageId: 'invalid-slotted-element',
              data: {
                allowed: 'nve-grid-row, nve-grid-header, nve-grid-footer, nve-grid-placeholder',
                child: 'table',
                parent: 'nve-grid'
              }
            }
          ]
        },
        {
          code: '<nve-grid-header><nve-grid-cell></nve-grid-cell></nve-grid-header>',
          errors: [
            {
              messageId: 'invalid-slotted-element',
              data: { allowed: 'nve-grid-column', child: 'nve-grid-cell', parent: 'nve-grid-header' }
            }
          ]
        },
        {
          code: '<nve-grid-row><div></div></nve-grid-row>',
          errors: [
            {
              messageId: 'invalid-slotted-element',
              data: { allowed: 'nve-grid-cell', child: 'div', parent: 'nve-grid-row' }
            }
          ]
        },
        {
          code: '<nve-tree><div></div></nve-tree>',
          errors: [
            {
              messageId: 'invalid-slotted-element',
              data: { allowed: 'nve-tree-node', child: 'div', parent: 'nve-tree' }
            }
          ]
        },
        {
          code: '<nve-menu><nve-button></nve-button></nve-menu>',
          errors: [
            {
              messageId: 'invalid-slotted-element',
              data: { allowed: 'nve-menu-item, nve-divider', child: 'nve-button', parent: 'nve-menu' }
            }
          ]
        },
        {
          code: '<nve-menu-group><nve-menu-item></nve-menu-item></nve-menu-group>',
          errors: [
            {
              messageId: 'invalid-slotted-element',
              data: { allowed: 'nve-menu', child: 'nve-menu-item', parent: 'nve-menu-group' }
            }
          ]
        },
        {
          code: '<nve-grid><div slot=""></div></nve-grid>',
          errors: [
            {
              messageId: 'invalid-slotted-element',
              data: {
                allowed: 'nve-grid-row, nve-grid-header, nve-grid-footer, nve-grid-placeholder',
                child: 'div',
                parent: 'nve-grid'
              }
            }
          ]
        },
        {
          code: '<nve-grid><ng-container><div></div></ng-container></nve-grid>',
          errors: [
            {
              messageId: 'invalid-slotted-element',
              data: {
                allowed: 'nve-grid-row, nve-grid-header, nve-grid-footer, nve-grid-placeholder',
                child: 'div',
                parent: 'nve-grid'
              }
            }
          ]
        }
      ]
    });
  });
});
