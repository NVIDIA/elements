import theme from '@nvidia-elements/themes/index.json' with { type: 'json' };

const spaceTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-space'))
  .map(([key, value]: [string, string]) => [
    key,
    parseInt(value.replace('nve-ref-scale-space * ', '').replace('px', ''))
  ])
  .map(([id, value]: [string, number]) => ({
    id,
    value,
    name: `var(--${id})`
  }));

const maxSpaceToken = spaceTokens.sort((a, b) => b.value - a.value)[0]; // 64
const minSpaceToken = spaceTokens.sort((a, b) => a.value - b.value)[0]; // 1

const sizeTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-size'))
  .map(([key, value]: [string, string]) => [
    key,
    parseInt(value.replace('nve-ref-scale-size * ', '').replace('px', ''))
  ])
  .map(([id, value]: [string, number]) => ({
    id,
    value,
    name: `var(--${id})`
  }));

const maxSizeToken = sizeTokens.sort((a, b) => b.value - a.value)[0]; // 40
const minSizeToken = sizeTokens.sort((a, b) => a.value - b.value)[0]; // 1

const fontSizeTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-font-size'))
  .map(([id, value]: [string, string]) => ({
    id,
    value: parseInt(value.replace('nve-ref-scale-text * ', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxFontSizeToken = fontSizeTokens.sort((a, b) => b.value - a.value)[0]; // 50
const minFontSizeToken = fontSizeTokens.sort((a, b) => a.value - b.value)[1]; // 12

const fontWeightTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-font-weight'))
  .map(([id, value]: [string, string]) => ({
    id,
    value,
    name: `var(--${id})`
  }));

const borderRadiusTokens = Object.entries(theme)
  .filter(([key, value]: [string, string]) => key.includes('nve-ref-border-radius') && !value.includes('999'))
  .map(([id, value]: [string, string]) => ({
    id,
    value: parseInt(value.replace('nve-ref-scale-border-radius * ', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxBorderRadiusToken = borderRadiusTokens.sort((a, b) => b.value - a.value)[0]; // 48
const minBorderRadiusToken = borderRadiusTokens.sort((a, b) => a.value - b.value)[0]; // 0

const borderWidthTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-border-width'))
  .map(([key, value]: [string, string]) => [
    key,
    parseInt(value.replace('nve-ref-scale-border-width * ', '').replace('px', ''))
  ])
  .map(([id, value]: [string, number]) => ({
    id,
    value,
    name: `var(--${id})`
  }));

const maxBorderWidthToken = borderWidthTokens.sort((a, b) => b.value - a.value)[0]; // 4
const minBorderWidthToken = borderWidthTokens.sort((a, b) => a.value - b.value)[0]; // 1

export default {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Do not allow use of invalid CSS theme variables.',
      category: 'Best Practice',
      recommended: true,
      url: ''
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
            ?.find(child => child.name.match(/^--nve-.*-background$/));

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
};
