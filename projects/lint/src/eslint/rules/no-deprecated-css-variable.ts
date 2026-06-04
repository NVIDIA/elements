// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { theme } from '@nvidia-elements/themes';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { CssDeclarationNode, CssValueChild, HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

interface DeprecatedCssVariable {
  alternative: string;
  replacement?: string;
  selectors?: string[];
}

interface CssRuleNode {
  type?: string;
  prelude?: unknown;
}

const DEPRECATED_CSS_VARIABLES: Record<string, DeprecatedCssVariable> = {
  '--breadcrumb-height': { alternative: '--height', replacement: '--height' },
  '--item-text-size': { alternative: '--font-size', replacement: '--font-size' },
  '--item-color': { alternative: '--color', replacement: '--color' },
  '--item-active-color': { alternative: 'active breadcrumb item styles' },
  '--item-active-font-weight': { alternative: 'active breadcrumb item styles' },
  '--border-background': {
    alternative: '--indicator-background',
    replacement: '--indicator-background',
    selectors: ['nve-tabs', 'nve-tabs-item']
  },
  '--border-height': {
    alternative: '--indicator-height',
    replacement: '--indicator-height',
    selectors: ['nve-tabs', 'nve-tabs-item']
  },
  '--border-width': { alternative: 'the nve-tabs selected indicator', selectors: ['nve-tabs', 'nve-tabs-item'] },
  '--border-top': { alternative: 'the nve-tabs selected indicator', selectors: ['nve-tabs', 'nve-tabs-item'] }
};

const VAR_REFERENCE = /var\(\s*(--[\w-]+)/g;
const VAR_ASSIGNMENT = /(--[\w-]+)\s*:/g;

function getMlvReplacement(name: string): DeprecatedCssVariable | undefined {
  if (!name.startsWith('--mlv-')) return undefined;
  const replacement = name.replace('--mlv-', '--nve-');
  return theme[replacement.replace('--', '')] ? { alternative: replacement, replacement } : undefined;
}

function matchesSelector(config: DeprecatedCssVariable, selector: string) {
  return !config.selectors || config.selectors.some(scope => selector.includes(scope));
}

function getDeprecatedCssVariable(name: string, selector = ''): DeprecatedCssVariable | undefined {
  const config = DEPRECATED_CSS_VARIABLES[name] ?? getMlvReplacement(name);
  return config && matchesSelector(config, selector) ? config : undefined;
}

function getVarChildren(node: CssDeclarationNode) {
  return (
    node.value.children
      ?.filter((child: CssValueChild) => child.name === 'var')
      ?.flatMap((child: CssValueChild) => child.children ?? []) ?? []
  );
}

function getSelector(context: Rule.RuleContext, node: CssDeclarationNode) {
  const sourceCode = context.sourceCode as Rule.RuleContext['sourceCode'] & {
    getAncestors(node: Rule.Node): Rule.Node[];
  };
  const ruleNode = [...sourceCode.getAncestors(node as unknown as Rule.Node)].reverse().find(ancestor => {
    const candidate = ancestor as CssRuleNode;
    return candidate.type === 'Rule' && candidate.prelude;
  }) as CssRuleNode | undefined;

  return ruleNode?.prelude ? sourceCode.getText(ruleNode.prelude as Rule.Node) : '';
}

function findDeprecatedCssVariables(text: string, selector: string) {
  const deprecated = new Set<string>();
  for (const match of text.matchAll(VAR_REFERENCE)) {
    if (match[1] && getDeprecatedCssVariable(match[1], selector)) deprecated.add(match[1]);
  }
  for (const match of text.matchAll(VAR_ASSIGNMENT)) {
    if (match[1] && getDeprecatedCssVariable(match[1], selector)) deprecated.add(match[1]);
  }
  return [...deprecated];
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated CSS custom properties.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    fixable: 'code' as const,
    schema: [],
    messages: {
      ['deprecated-css-var']: 'Use of deprecated {{value}}. Use {{alternative}} instead.'
    }
  },
  create(context: Rule.RuleContext) {
    const cssVisitors = {
      Declaration(node: CssDeclarationNode) {
        const selector = getSelector(context, node);
        const assignmentConfig = getDeprecatedCssVariable(node.property, selector);
        if (assignmentConfig) {
          const replacement = assignmentConfig.replacement;
          context.report({
            messageId: 'deprecated-css-var',
            node: node as unknown as Rule.Node,
            data: {
              value: node.property,
              alternative: assignmentConfig.alternative
            },
            fix: replacement
              ? fixer =>
                  fixer.replaceText(
                    node as unknown as Rule.Node,
                    context.sourceCode.getText(node as unknown as Rule.Node).replace(node.property, replacement)
                  )
              : undefined
          });
        }

        getVarChildren(node).forEach(child => {
          const name = child.name;
          const config = name ? getDeprecatedCssVariable(name, selector) : undefined;
          if (!name || !config) return;
          const replacement = config.replacement;
          context.report({
            messageId: 'deprecated-css-var',
            node: child as unknown as Rule.Node,
            data: {
              value: name,
              alternative: config.alternative
            },
            fix: replacement ? fixer => fixer.replaceText(child as unknown as Rule.Node, replacement) : undefined
          });
        });
      }
    };

    try {
      const htmlVisitors = createVisitors(context, {
        StyleTag(node: HtmlTagNode) {
          const text = context.sourceCode.getText(node as unknown as Rule.Node);
          findDeprecatedCssVariables(text, text).forEach(name => {
            const config = getDeprecatedCssVariable(name, text);
            if (!config) return;
            context.report({
              messageId: 'deprecated-css-var',
              node: node as unknown as Rule.Node,
              data: { value: name, alternative: config.alternative }
            });
          });
        },
        Tag(node: HtmlTagNode) {
          const styleAttr = findAttr(node, 'style');
          if (!styleAttr?.value?.value) return;
          findDeprecatedCssVariables(styleAttr.value.value, node.name).forEach(name => {
            const config = getDeprecatedCssVariable(name, node.name);
            if (!config) return;
            context.report({
              messageId: 'deprecated-css-var',
              node: styleAttr as unknown as Rule.Node,
              data: { value: name, alternative: config.alternative }
            });
          });
        }
      });

      return { ...cssVisitors, ...htmlVisitors };
    } catch {
      return cssVisitors;
    }
  }
} as const;

export default rule;
