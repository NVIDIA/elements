// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition, Rule } from 'eslint';
import css from '@eslint/css';
import html from '@html-eslint/eslint-plugin';
import noDeprecatedCssVariable from './no-deprecated-css-variable.js';
import type { CssDeclarationNode } from '../rule-types.js';

const rule = noDeprecatedCssVariable as unknown as JSRuleDefinition;

describe('noDeprecatedCssVariable', () => {
  it('should define rule metadata', () => {
    expect(noDeprecatedCssVariable.meta).toBeDefined();
    expect(noDeprecatedCssVariable.meta.type).toBe('problem');
    expect(noDeprecatedCssVariable.meta.docs).toBeDefined();
    expect(noDeprecatedCssVariable.meta.docs.description).toBe('Disallow use of deprecated CSS custom properties.');
    expect(noDeprecatedCssVariable.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedCssVariable.meta.docs.recommended).toBe(true);
    expect(noDeprecatedCssVariable.meta.docs.url).toContain('/docs/lint/');
    expect(noDeprecatedCssVariable.meta.schema).toBeDefined();
    expect(noDeprecatedCssVariable.meta.messages).toBeDefined();
  });

  describe('css', () => {
    let tester: RuleTester;

    beforeEach(() => {
      tester = new RuleTester({
        language: 'css/css',
        languageOptions: {
          tolerant: true
        },
        plugins: {
          css
        }
      });
    });

    it('should allow valid use of CSS custom properties', () => {
      tester.run('should allow valid use of CSS custom properties', rule, {
        valid: [
          ':root { margin: var(--nve-ref-space-md); }',
          ':root { gap: var(--nve-ref-space-md); }',
          ':root { color: var(--ui-color-primary); }',
          ':root { color: var(--mlv-custom-color-primary); }',
          ':root { margin: 1000px; }',
          ':root { color: blue; }',
          'nve-menu-item { --border-background: red; }',
          '.custom { --border-background: red; }',
          ':root { color: var(); }'
        ],
        invalid: []
      });
    });

    it('should not allow deprecated theme custom properties', () => {
      tester.run('should not allow deprecated theme custom properties', rule, {
        valid: [],
        invalid: [
          {
            code: ':root { margin: var(--mlv-ref-space-md); }',
            output: ':root { margin: var(--nve-ref-space-md); }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--mlv-ref-space-md', alternative: '--nve-ref-space-md' }
              }
            ]
          }
        ]
      });
    });

    it('should not allow deprecated breadcrumb custom properties', () => {
      tester.run('should not allow deprecated breadcrumb custom properties', rule, {
        valid: [],
        invalid: [
          {
            code: 'nve-breadcrumb { --breadcrumb-height: 32px; color: var(--item-color); }',
            output: 'nve-breadcrumb { --height: 32px; color: var(--color); }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--breadcrumb-height', alternative: '--height' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-color', alternative: '--color' }
              }
            ]
          },
          {
            code: 'nve-breadcrumb { --item-active-color: red; --item-active-font-weight: 700; }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-active-color', alternative: 'active breadcrumb item styles' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-active-font-weight', alternative: 'active breadcrumb item styles' }
              }
            ]
          }
        ]
      });
    });

    it('should not allow deprecated tabs indicator custom properties', () => {
      tester.run('should not allow deprecated tabs indicator custom properties', rule, {
        valid: [],
        invalid: [
          {
            code: 'nve-tabs-item { --border-background: red; --border-height: 4px; --border-width: 100%; --border-top: 0; }',
            output:
              'nve-tabs-item { --indicator-background: red; --indicator-height: 4px; --border-width: 100%; --border-top: 0; }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-background', alternative: '--indicator-background' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-height', alternative: '--indicator-height' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-width', alternative: 'the nve-tabs selected indicator' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-top', alternative: 'the nve-tabs selected indicator' }
              }
            ]
          },
          {
            code: 'nve-tabs { color: var(--border-background); }',
            output: 'nve-tabs { color: var(--indicator-background); }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-background', alternative: '--indicator-background' }
              }
            ]
          },
          {
            code: 'nve-breadcrumb { color: var(--item-active-color); font-size: var(--item-text-size); }',
            output: 'nve-breadcrumb { color: var(--item-active-color); font-size: var(--font-size); }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-active-color', alternative: 'active breadcrumb item styles' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-text-size', alternative: '--font-size' }
              }
            ]
          }
        ]
      });
    });
  });

  describe('html', () => {
    let tester: RuleTester;

    beforeEach(() => {
      tester = new RuleTester({
        language: 'html/html',
        languageOptions: {
          tolerant: true
        },
        plugins: {
          html
        }
      });
    });

    it('should allow valid inline custom properties', () => {
      tester.run('should allow valid inline custom properties', rule, {
        valid: [
          '<nve-breadcrumb style="--height: 32px;"></nve-breadcrumb>',
          '<nve-tabs style="--indicator-background: red;"></nve-tabs>',
          '<nve-menu-item style="--border-background: red;"></nve-menu-item>',
          '<div></div>',
          '<div style=""></div>'
        ],
        invalid: []
      });
    });

    it('should allow valid custom properties in style tags', () => {
      tester.run('should allow valid custom properties in style tags', rule, {
        valid: [
          '<style>:root { margin: var(--nve-ref-space-md); }</style>',
          '<style>.custom { --border-background: red; }</style>'
        ],
        invalid: []
      });
    });

    it('should not allow deprecated inline custom properties', () => {
      tester.run('should not allow deprecated inline custom properties', rule, {
        valid: [],
        invalid: [
          {
            code: '<nve-breadcrumb style="--breadcrumb-height: 32px;"></nve-breadcrumb>',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--breadcrumb-height', alternative: '--height' }
              }
            ]
          },
          {
            code: '<nve-tabs-item style="--border-background: red;"></nve-tabs-item>',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-background', alternative: '--indicator-background' }
              }
            ]
          },
          {
            code: '<nve-breadcrumb style="color: var(--item-color);"></nve-breadcrumb>',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-color', alternative: '--color' }
              }
            ]
          }
        ]
      });
    });

    it('should not allow deprecated custom properties in style tags', () => {
      tester.run('should not allow deprecated custom properties in style tags', rule, {
        valid: [],
        invalid: [
          {
            code: '<style>nve-breadcrumb { --breadcrumb-height: 32px; color: var(--item-color); }</style>',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-color', alternative: '--color' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--breadcrumb-height', alternative: '--height' }
              }
            ]
          },
          {
            code: '<style>:root { margin: var(--mlv-ref-space-md); }</style>',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--mlv-ref-space-md', alternative: '--nve-ref-space-md' }
              }
            ]
          },
          {
            code: '<style>nve-tabs { color: var(--border-background); }</style>',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-background', alternative: '--indicator-background' }
              }
            ]
          }
        ]
      });
    });
  });

  describe('visitors', () => {
    function createContext(ancestors: Rule.Node[] = []) {
      const reports: Array<{ messageId: string; data?: Record<string, unknown> }> = [];
      const context = {
        report(descriptor: { messageId: string; data?: Record<string, unknown> }) {
          reports.push({ messageId: descriptor.messageId, data: descriptor.data });
        },
        sourceCode: {
          getText(node: { property?: string }) {
            return node.property ?? '';
          },
          getAncestors() {
            return ancestors;
          }
        }
      } as unknown as Rule.RuleContext;

      return { context, reports };
    }

    function visitDeclaration(listeners: ReturnType<typeof noDeprecatedCssVariable.create>, node: CssDeclarationNode) {
      const visit = listeners.Declaration as ((declaration: CssDeclarationNode) => void) | undefined;
      visit?.(node);
    }

    it('should report unscoped deprecated assignments when no rule selector exists', () => {
      const { context, reports } = createContext();
      visitDeclaration(noDeprecatedCssVariable.create(context), {
        type: 'Declaration',
        property: '--breadcrumb-height',
        value: { value: '32px', children: [] }
      });
      expect(reports).toEqual([
        {
          messageId: 'deprecated-css-var',
          data: { value: '--breadcrumb-height', alternative: '--height' }
        }
      ]);
    });

    it('should ignore var functions without identifiers', () => {
      const { context, reports } = createContext();
      visitDeclaration(noDeprecatedCssVariable.create(context), {
        type: 'Declaration',
        property: 'color',
        value: {
          value: 'var()',
          children: [{ type: 'Function', name: 'var' }]
        }
      });
      expect(reports).toEqual([]);
    });

    it('should ignore nameless var children', () => {
      const { context, reports } = createContext();
      visitDeclaration(noDeprecatedCssVariable.create(context), {
        type: 'Declaration',
        property: 'color',
        value: {
          value: 'var()',
          children: [{ type: 'Function', name: 'var', children: [{ type: 'Identifier' }] }]
        }
      });
      expect(reports).toEqual([]);
    });
  });
});
