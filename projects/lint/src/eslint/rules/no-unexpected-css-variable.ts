// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { defineRuleDocumentation } from '../rule-documentation.js';
import { theme } from '@nvidia-elements/themes';
import type { CssDeclarationNode, CssValueChild } from '../rule-types.js';

const spaceTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-space'))
  .map(([key, value]) => ({
    id: key,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-space) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${key})`
  }));

const sizeTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-size'))
  .map(([key, value]) => ({
    id: key,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-size) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${key})`
  }));

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-unexpected-css-variable',
      description: 'Disallow use of invalid CSS theme variables.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'css',
        valid: ':root { margin: var(--nve-ref-space-md); }',
        invalid: ':root { margin: var(--nve-ref-size-300); }'
      }
    }),
    fixable: 'code' as const,
    schema: [],
    messages: {
      ['unexpected-css-var']: 'Unexpected use of {{value}} for CSS {{property}}. Use {{alternate}} option instead.'
    }
  },
  create(context: Rule.RuleContext) {
    function findVarChild(node: CssDeclarationNode, pattern: RegExp) {
      return node.value.children
        ?.filter((child: CssValueChild) => child.name === 'var')
        ?.flatMap((child: CssValueChild) => child.children ?? [])
        ?.find((child: CssValueChild) => child?.name?.match(pattern));
    }

    function checkSizeVarInSpaceProperty(node: CssDeclarationNode) {
      if (!node.property.includes('margin') && !node.property.includes('gap')) return;
      const child = findVarChild(node, /^--nve-ref-size-/);
      if (!child) return;
      const sizeToken = sizeTokens.find(token => token.name.includes(child.name));
      const alternate = spaceTokens.find(spaceToken => spaceToken.value === sizeToken?.value)?.name;
      context.report({
        messageId: 'unexpected-css-var',
        node: node as unknown as Rule.Node,
        data: { value: child.name, property: node.property, alternate: alternate ?? 'var(--nve-ref-space-*)' },
        fix: alternate
          ? (fixer: Rule.RuleFixer) => fixer.replaceText(node as unknown as Rule.Node, `${node.property}: ${alternate}`)
          : undefined
      });
    }

    function checkSpaceVarInSizeProperty(node: CssDeclarationNode) {
      if (node.property !== 'width' && node.property !== 'height') return;
      const child = findVarChild(node, /^--nve-ref-space-/);
      if (!child) return;
      const spaceToken = spaceTokens.find(token => token.name.includes(child.name));
      const alternate = sizeTokens.find(sizeToken => sizeToken.value === spaceToken?.value)?.name;
      context.report({
        messageId: 'unexpected-css-var',
        node: node as unknown as Rule.Node,
        data: { value: child.name, property: node.property, alternate: alternate ?? 'var(--nve-ref-size-*)' },
        fix: alternate
          ? (fixer: Rule.RuleFixer) => fixer.replaceText(node as unknown as Rule.Node, `${node.property}: ${alternate}`)
          : undefined
      });
    }

    function checkColorVarInBackground(node: CssDeclarationNode) {
      if (node.property !== 'background') return;
      const child = findVarChild(node, /^--nve-.*-color$/);
      if (!child) return;
      context.report({
        messageId: 'unexpected-css-var',
        node: node as unknown as Rule.Node,
        data: { value: child.name, property: node.property, alternate: 'var(--nve-*-background)' }
      });
    }

    function checkBackgroundVarInColor(node: CssDeclarationNode) {
      if (node.property !== 'color') return;
      const child = findVarChild(node, /^--nve-.*-background$/);
      if (!child) return;
      context.report({
        messageId: 'unexpected-css-var',
        node: node as unknown as Rule.Node,
        data: { value: child.name, property: node.property, alternate: 'var(--nve-*-color)' }
      });
    }

    return {
      Declaration(node: CssDeclarationNode) {
        checkSizeVarInSpaceProperty(node);
        checkSpaceVarInSizeProperty(node);
        checkColorVarInBackground(node);
        checkBackgroundVarInColor(node);
      }
    };
  }
} as const;

export default rule;
