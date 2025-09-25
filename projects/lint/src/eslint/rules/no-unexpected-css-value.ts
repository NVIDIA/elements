import { theme } from '@nvidia-elements/themes';

const spaceTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-space'))
  .map(([id, value]: [string, string]) => ({
    id,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-space) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxSpaceToken = spaceTokens.sort((a, b) => b.value - a.value)[0]; // 64
const minSpaceToken = spaceTokens.sort((a, b) => a.value - b.value)[0]; // 1

const sizeTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-size'))
  .map(([id, value]: [string, string]) => ({
    id,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-size) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxSizeToken = sizeTokens.sort((a, b) => b.value - a.value)[0]; // 40
const minSizeToken = sizeTokens.sort((a, b) => a.value - b.value)[0]; // 1

const fontSizeTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-font-size'))
  .map(([id, value]: [string, string]) => ({
    id,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-text) * ', '').replace(')', '').replace('px', '')),
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
    value: parseInt(value.replace('calc(var(--nve-ref-scale-border-radius) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxBorderRadiusToken = borderRadiusTokens.sort((a, b) => b.value - a.value)[0]; // 48
const minBorderRadiusToken = borderRadiusTokens.sort((a, b) => a.value - b.value)[0]; // 0

const borderWidthTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-border-width'))
  .map(([key, value]: [string, string]) => [
    key,
    parseInt(value.replace('calc(var(--nve-ref-scale-border-width) * ', '').replace(')', '').replace('px', ''))
  ])
  .map(([id, value]: [string, number]) => ({
    id,
    value,
    name: `var(--${id})`
  }));

const maxBorderWidthToken = borderWidthTokens.sort((a, b) => b.value - a.value)[0]; // 4
const minBorderWidthToken = borderWidthTokens.sort((a, b) => a.value - b.value)[0]; // 1

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of invalid CSS values.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    fixable: 'code' as const,
    schema: [],
    messages: {
      ['unexpected-css-value']:
        'Unexpected use of {{value}}{{unit}} value for CSS {{property}}. Use {{alternate}} option instead.'
    }
  },
  create(context) {
    return {
      Declaration(node) {
        // unexpected-css-value space
        if (node.property.includes('margin') || node.property.includes('gap')) {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value);
            const isDimension = child.type === 'Dimension';
            const isPixelUnit = child.unit === 'px';
            const isWithinSizeTokenRange = value <= maxSpaceToken.value && value >= minSpaceToken.value && value !== 1;
            return isDimension && isPixelUnit && isWithinSizeTokenRange;
          });

          if (child) {
            const alternate = spaceTokens.find(token => token.value === parseInt(child.value))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: node.property,
                alternate: alternate ?? 'var(--nve-ref-space-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${node.property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value size
        if (node.property === 'width' || node.property === 'height') {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value);
            const isDimension = child.type === 'Dimension';
            const isPixelUnit = child.unit === 'px';
            const isWithinSizeTokenRange = value <= maxSizeToken.value && value >= minSizeToken.value;
            return isDimension && isPixelUnit && isWithinSizeTokenRange;
          });

          if (child) {
            const alternate = sizeTokens.find(token => token.value === parseInt(child.value))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: node.property,
                alternate: alternate ?? 'var(--nve-ref-size-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${node.property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value font-size
        if (node.property === 'font-size') {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value);
            const isDimension = child.type === 'Dimension';
            const isPixelUnit = child.unit === 'px';
            const isWithinFontSizeTokenRange = value <= maxFontSizeToken.value && value >= minFontSizeToken.value;
            return isDimension && isPixelUnit && isWithinFontSizeTokenRange;
          });
          if (child) {
            const alternate = fontSizeTokens.find(token => token.value === parseInt(child.value))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: node.property,
                alternate: alternate ?? 'var(--nve-ref-font-size-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${node.property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value font-weight
        if (node.property === 'font-weight') {
          const child = node.value.children?.find(child => child.name !== 'var');
          if (child) {
            const alternate = fontWeightTokens.find(token => token.value === child.value)?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value ?? '',
                unit: child.name ?? '',
                property: node.property,
                alternate: alternate ?? 'var(--nve-ref-font-weight-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${node.property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value line-height
        if (node.property === 'line-height') {
          const child = node.value.children?.find(child => child.type === 'Dimension' && child.unit === 'px');

          if (child) {
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: node.property,
                alternate: 'var(--nve-ref-font-line-height-*)'
              }
            });
          }
        }

        // unexpected-css-value opacity
        if (node.property === 'opacity') {
          const child = node.value.children?.find(
            child => child.type === 'Number' && child.value !== '0' && child.value !== '1'
          );

          if (child) {
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value ?? '',
                unit: child.unit ?? '',
                property: node.property,
                alternate: 'var(--nve-ref-opacity-*)'
              }
            });
          }
        }

        // unexpected-css-value border-radius
        if (node.property === 'border-radius') {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value);
            const isDimension = child.type === 'Dimension' && child.unit === 'px';
            const isNumber = child.type === 'Number' && child.unit === undefined;
            const isWithinBorderRadiusTokenRange =
              value <= maxBorderRadiusToken.value && value >= minBorderRadiusToken.value;
            return (isDimension || isNumber) && isWithinBorderRadiusTokenRange;
          });

          if (child) {
            const alternate = borderRadiusTokens.find(token => token.value === parseInt(child.value))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit ?? '',
                property: node.property,
                alternate: alternate ?? 'var(--nve-ref-border-radius-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${node.property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value border-width
        if (node.property === 'border-width') {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value);
            const isDimension = child.type === 'Dimension';
            const isPixelUnit = child.unit === 'px';
            const isWithinBorderWidthTokenRange =
              value <= maxBorderWidthToken.value && value >= minBorderWidthToken.value;
            return isDimension && isPixelUnit && isWithinBorderWidthTokenRange;
          });

          if (child) {
            const alternate = borderWidthTokens.find(token => token.value === parseInt(child.value))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: node.property,
                alternate: alternate ?? 'var(--nve-ref-border-width-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${node.property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value box-shadow
        if (node.property === 'box-shadow') {
          const child = node.value.children?.find(child => child.type === 'Dimension');

          if (child && !JSON.stringify(node.value).includes('Highlight')) {
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: node.property,
                alternate: 'var(--nve-ref-shadow-*)'
              }
            });
          }
        }

        // unexpected-css-value color
        if (node.property === 'color' || node.property === 'background') {
          const child = node.value.children?.find(
            child => child.type === 'Hash' || child.name?.includes('hsl') || child.name?.includes('rgb')
          );

          if (child) {
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.type === 'Hash' ? `#${child.value}` : child.name,
                unit: child.type === 'Hash' ? '' : child.name,
                property: node.property,
                alternate: `var(--nve-*-${node.property})`
              }
            });
          }
        }
      }
    };
  }
} as const;

export default rule;
