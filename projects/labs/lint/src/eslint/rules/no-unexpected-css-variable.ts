import { theme } from '@nvidia-elements/themes';

const spaceTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-space'))
  .map(([key, value]: [string, string]) => [
    key,
    parseInt(value.replace('calc(var(--nve-ref-scale-space) * ', '').replace(')', '').replace('px', ''))
  ])
  .map(([id, value]: [string, number]) => ({
    id,
    value,
    name: `var(--${id})`
  }));

const sizeTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-size'))
  .map(([key, value]: [string, string]) => [
    key,
    parseInt(value.replace('calc(var(--nve-ref-scale-size) * ', '').replace(')', '').replace('px', ''))
  ])
  .map(([id, value]: [string, number]) => ({
    id,
    value,
    name: `var(--${id})`
  }));

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of invalid CSS theme variables.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    fixable: 'code' as const,
    schema: [],
    messages: {
      ['unexpected-css-var']: 'Unexpected use of {{value}} for CSS {{property}}. Use {{alternate}} option instead.'
    }
  },
  create(context) {
    return {
      Declaration(node) {
        // unexpected-css-var size
        if (node.property.includes('margin') || node.property.includes('gap')) {
          const child = node.value.children
            ?.filter(child => child.name === 'var')
            ?.flatMap(child => child.children)
            ?.find(child => child?.name?.match(/^--nve-ref-size-/));

          if (child) {
            const sizeToken = sizeTokens.find(token => token.name.includes(child.name));
            const alternate = spaceTokens.find(spaceToken => spaceToken.value === sizeToken?.value)?.name;
            context.report({
              messageId: 'unexpected-css-var',
              node,
              data: {
                value: child.name,
                property: node.property,
                alternate: alternate ?? 'var(--nve-ref-space-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${node.property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-var space
        if (node.property === 'width' || node.property === 'height') {
          const child = node.value.children
            ?.filter(child => child.name === 'var')
            ?.flatMap(child => child.children)
            ?.find(child => child?.name?.match(/^--nve-ref-space-/));

          if (child) {
            const spaceToken = spaceTokens.find(token => token.name.includes(child.name));
            const alternate = sizeTokens.find(sizeToken => sizeToken.value === spaceToken.value)?.name;
            context.report({
              messageId: 'unexpected-css-var',
              node,
              data: {
                value: child.name,
                property: node.property,
                alternate: alternate ?? 'var(--nve-ref-size-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${node.property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-var color
        if (node.property === 'background') {
          const child = node.value.children
            ?.filter(child => child.name === 'var')
            ?.flatMap(child => child.children)
            ?.find(child => child?.name?.match(/^--nve-.*-color$/));

          if (child) {
            context.report({
              messageId: 'unexpected-css-var',
              node,
              data: {
                value: child.name,
                property: node.property,
                alternate: 'var(--nve-*-background)'
              }
            });
          }
        }

        // unexpected-css-var background
        if (node.property === 'color') {
          const child = node.value.children
            ?.filter(child => child.name === 'var')
            ?.flatMap(child => child.children)
            ?.find(child => child?.name?.match(/^--nve-.*-background$/));

          if (child) {
            context.report({
              messageId: 'unexpected-css-var',
              node,
              data: {
                value: child.name,
                property: node.property,
                alternate: 'var(--nve-*-color)'
              }
            });
          }
        }
      }
    };
  }
} as const;

export default rule;
