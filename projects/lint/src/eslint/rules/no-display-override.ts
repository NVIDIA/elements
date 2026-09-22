// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { defineRuleDocumentation } from '../rule-documentation.js';
import { selectorTargetsNveElement, selectorsForRule } from '../internals/css.js';
import type { CssDeclarationNode, CssRuleNode } from '../rule-types.js';

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-display-override',
      description: 'Disallow display overrides on Elements components.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'css',
        valid: '.layout { display: grid; }',
        invalid: 'nve-card { display: flex; }'
      }
    }),
    schema: [],
    messages: {
      ['display-override']:
        'Unexpected "display: {{value}}" override on an nve-* element. Use the component API or a wrapper for layout.'
    }
  },
  create(context: Rule.RuleContext) {
    const ruleTargetStack: boolean[] = [];

    return {
      Rule(node: CssRuleNode) {
        const parentTargetsNve = ruleTargetStack[ruleTargetStack.length - 1] ?? false;
        const targetsNve = selectorsForRule(node).some(selector =>
          selectorTargetsNveElement(selector, parentTargetsNve)
        );
        ruleTargetStack.push(targetsNve);
      },
      'Rule:exit'() {
        ruleTargetStack.pop();
      },
      Declaration(node: CssDeclarationNode) {
        if (node.property !== 'display' || !ruleTargetStack[ruleTargetStack.length - 1]) return;

        const value = context.sourceCode
          .getText(node.value as unknown as Rule.Node)
          .trim()
          .toLowerCase();
        if (value === 'none') return;

        context.report({
          node: node as unknown as Rule.Node,
          messageId: 'display-override',
          data: { value }
        });
      }
    };
  }
} as const;

export default rule;
