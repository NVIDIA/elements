// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { theme } from '@nvidia-elements/themes';
import type { CssDeclarationNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated --mlv-* CSS theme variables.',
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
    return {
      Declaration(node: CssDeclarationNode) {
        // unknown-css-var
        const child = node.value.children
          ?.filter(child => child.name === 'var')
          ?.flatMap(child => child.children)
          ?.find(child => child?.name?.includes('--mlv'));

        if (child?.name && theme[child.name.replace('--mlv-', 'nve-')]) {
          context.report({
            messageId: 'deprecated-css-var',
            node: child as unknown as Rule.Node,
            data: {
              value: child.name,
              alternative: child.name.replace('--mlv-', '--nve-')
            }
          });
        }
      }
    };
  }
} as const;

export default rule;
