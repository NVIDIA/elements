// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { CSSLanguage } from '@eslint/css';
import type { CssDeclarationNode, CssValueChild } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

const BACKGROUND_PROPERTIES = new Set(['background', 'background-image', '--background']);
const GRADIENT_FUNCTIONS = new Set([
  'conic-gradient',
  'linear-gradient',
  'radial-gradient',
  'repeating-conic-gradient',
  'repeating-linear-gradient',
  'repeating-radial-gradient'
]);
const cssLanguage = new CSSLanguage();

function isGradientFunctionChild(child: CssValueChild): boolean {
  return child.type === 'Function' && GRADIENT_FUNCTIONS.has(child.name.toLowerCase());
}

function customBackgroundValueChildren(value: string): CssValueChild[] {
  const parsed = cssLanguage.parse(
    { body: `.value { background: ${value}; }`, path: 'custom-property.css' } as Parameters<CSSLanguage['parse']>[0],
    { languageOptions: { tolerant: true } }
  );
  if (!parsed.ok) return [];

  const rule = parsed.ast.children[0] as unknown as {
    block?: { children?: Array<{ value?: { children?: CssValueChild[] } }> };
  };
  return rule?.block?.children?.[0]?.value?.children ?? [];
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow custom gradients in CSS backgrounds.',
      category: 'Best Practice',
      recommended: false,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['custom-background-gradient']:
        'Unexpected custom gradient in a CSS background. Use Elements theme surfaces and tokens instead.'
    }
  },
  create(context: Rule.RuleContext) {
    return {
      Declaration(node: CssDeclarationNode) {
        if (!BACKGROUND_PROPERTIES.has(node.property)) return;
        const children =
          node.property === '--background'
            ? customBackgroundValueChildren(context.sourceCode.getText(node.value as unknown as Rule.Node))
            : node.value.children;
        if (!children?.some(isGradientFunctionChild)) return;

        context.report({
          node: node as unknown as Rule.Node,
          messageId: 'custom-background-gradient'
        });
      }
    };
  }
} as const;

export default rule;
