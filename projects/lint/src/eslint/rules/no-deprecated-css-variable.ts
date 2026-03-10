import type { Rule } from 'eslint';
import { theme } from '@nvidia-elements/themes';
import type { CssDeclarationNode } from '../rule-types.js';

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated --nve-* CSS theme variables.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
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

        if (child?.name && theme[child.name.replace('--nve-', 'nve-')]) {
          context.report({
            messageId: 'deprecated-css-var',
            node: child as unknown as Rule.Node,
            data: {
              value: child.name,
              alternative: child.name.replace('--nve-', '--nve-')
            }
          });
        }
      }
    };
  }
} as const;

export default rule;
