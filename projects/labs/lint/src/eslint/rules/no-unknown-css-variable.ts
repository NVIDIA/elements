import { theme } from '@nvidia-elements/themes';

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of unknown --nve-* CSS theme variables.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unknown-css-var']: 'Unknown use of {{value}}. Use provided --nve-* theme variables instead.'
    }
  },
  create(context) {
    return {
      Declaration(node) {
        // unknown-css-var
        const children = node.value.children
          ?.filter(child => child.name === 'var')
          ?.flatMap(child => child.children)
          ?.filter(child => child.name && child.name.match(/^--nve-/) && !child.name.includes('--nve-debug-'));

        const unknownName = children?.find(child => theme[child.name.replace('--', '')] === undefined);
        if (unknownName) {
          context.report({
            messageId: 'unknown-css-var',
            node,
            data: {
              value: unknownName.name
            }
          });
        }
      }
    };
  }
} as const;

export default rule;
