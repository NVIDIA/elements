// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { canRenderTogether, getInstanceContext } from '../internals/instance-context.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-multiple-page-elements',
      description: 'Require one page shell per template.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-page></nve-page>',
        invalid: '<nve-page></nve-page><nve-page></nve-page>'
      }
    }),
    schema: [],
    messages: {
      ['multiple-pages']: 'This template declares multiple <nve-page> elements. Use one page shell.',
      ['repeated-page']: '<nve-page> is created in repeated content. Use one page shell outside the repetition.'
    }
  },
  create(context: Rule.RuleContext) {
    const instances: ReturnType<typeof getInstanceContext>[] = [];
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (node.name.toLowerCase() !== 'nve-page') return;
        const instance = getInstanceContext(context, node);
        const { scope, repeated } = instance;
        if (repeated) {
          context.report({ node, messageId: 'repeated-page' });
          return;
        }
        if (!scope) return;
        if (instances.some(previous => canRenderTogether(previous, instance)))
          context.report({ node, messageId: 'multiple-pages' });
        instances.push(instance);
      }
    });
  }
} as const;

export default rule;
