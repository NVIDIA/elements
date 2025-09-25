import { theme } from '@nvidia-elements/themes';

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
  create(context) {
    return {
      Declaration(node) {
        // unknown-css-var
        const child = node.value.children
          ?.filter(child => child.name === 'var')
          ?.flatMap(child => child.children)
          ?.find(child => child?.name?.includes('--mlv'));

        const deprecatedName = child?.name ? theme[child.name.replace('--nve-', 'nve-')] : false;
        if (deprecatedName) {
          context.report({
            messageId: 'deprecated-css-var',
            node,
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
