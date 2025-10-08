import { theme } from '@nvidia-elements/themes';

// internal/private theme variables
const globals = new Set([
  '--nve-config-experimental',
  '--nve-config-color-scheme-dark',
  '--nve-debug-outline-width',
  '--nve-debug-element-outline',
  '--nve-debug-typography-outline',
  '--nve-debug-layout-outline'
]);

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
        const children = node.value.children
          ?.filter(child => child.name === 'var')
          ?.flatMap(child => child.children)
          ?.filter(child => child.name && child.name.match(/^--nve-/) && !globals.has(child.name));

        const unknownReference = children?.find(child => theme[child.name.replace('--', '')] === undefined);
        if (unknownReference) {
          context.report({
            messageId: 'unknown-css-var',
            node,
            data: {
              value: unknownReference.name
            }
          });
        }

        const unknownAssignment =
          node.property &&
          node.property.match(/^--nve-/) &&
          !globals.has(node.property) &&
          theme[node.property.replace('--', '')] === undefined;
        if (unknownAssignment) {
          context.report({
            messageId: 'unknown-css-var',
            node,
            data: {
              value: node.property
            }
          });
        }
      }
    };
  }
} as const;

export default rule;
