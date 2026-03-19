// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { theme } from '@nvidia-elements/themes';
import type { CssDeclarationNode } from '../rule-types.js';

const spaceTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-space'))
  .map(([id, value]) => ({
    id,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-space) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxSpaceToken = spaceTokens.sort((a, b) => b.value - a.value)[0]!;
const minSpaceToken = spaceTokens.sort((a, b) => a.value - b.value)[0]!;

const sizeTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-size'))
  .map(([id, value]) => ({
    id,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-size) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxSizeToken = sizeTokens.sort((a, b) => b.value - a.value)[0]!;
const minSizeToken = sizeTokens.sort((a, b) => a.value - b.value)[0]!;

const fontSizeTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-font-size'))
  .map(([id, value]) => ({
    id,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-text) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxFontSizeToken = fontSizeTokens.sort((a, b) => b.value - a.value)[0]!;
const minFontSizeToken = fontSizeTokens.sort((a, b) => a.value - b.value)[1]!;

const fontWeightTokens = [
  ...Object.entries(theme)
    .filter(([key]) => key.includes('nve-ref-font-weight'))
    .map(([id, value]) => ({
      value,
      name: `var(--${id})`
    })),
  {
    value: '100',
    name: 'var(--nve-ref-font-weight-light)'
  },
  {
    value: '300',
    name: 'var(--nve-ref-font-weight-light)'
  },
  {
    value: '900',
    name: 'var(--nve-ref-font-weight-extra-bold)'
  },
  {
    value: 'normal',
    name: 'var(--nve-ref-font-weight-regular)'
  },
  {
    value: 'bold',
    name: 'var(--nve-ref-font-weight-bold)'
  }
];

const borderRadiusTokens = Object.entries(theme)
  .filter(([key, value]) => key.includes('nve-ref-border-radius') && !value.includes('999'))
  .map(([id, value]) => ({
    id,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-border-radius) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxBorderRadiusToken = borderRadiusTokens.sort((a, b) => b.value - a.value)[0]!;
const minBorderRadiusToken = borderRadiusTokens.sort((a, b) => a.value - b.value)[0]!;

const borderWidthTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-border-width'))
  .map(([key, value]) => ({
    id: key,
    value: parseInt(value.replace('calc(var(--nve-ref-scale-border-width) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${key})`
  }));

const maxBorderWidthToken = borderWidthTokens.sort((a, b) => b.value - a.value)[0]!;
const minBorderWidthToken = borderWidthTokens.sort((a, b) => a.value - b.value)[0]!;

const lineHeightTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-font-line-height'))
  .map(([id, value]) => ({
    value: parseInt(value.replace('calc(var(--nve-ref-scale-line-height) * ', '').replace(')', '').replace('px', '')),
    name: `var(--${id})`
  }));

const maxLineHeightToken = lineHeightTokens.sort((a, b) => b.value - a.value)[0]!;
const minLineHeightToken = lineHeightTokens.sort((a, b) => a.value - b.value)[0]!;

const opacityTokens = Object.entries(theme)
  .filter(([key]) => key.includes('nve-ref-opacity'))
  .map(([id, value]) => ({
    value,
    name: `var(--${id})`
  }));

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
  create(context: Rule.RuleContext) {
    return {
      Declaration(node: CssDeclarationNode) {
        const property = node.property;
        const propertyName = property.replace('--', '');

        // unexpected-css-value space
        if (propertyName.includes('margin') || propertyName.includes('gap')) {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value ?? '');
            const isDimension = child.type === 'Dimension';
            const isPixelUnit = child.unit === 'px';
            const isWithinSizeTokenRange = value <= maxSpaceToken.value && value >= minSpaceToken.value && value !== 1;
            return isDimension && isPixelUnit && isWithinSizeTokenRange;
          });

          if (child) {
            const alternate = spaceTokens.find(token => token.value === parseInt(child.value ?? ''))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: property,
                alternate: alternate ?? 'var(--nve-ref-space-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value size
        if (propertyName === 'width' || propertyName === 'height') {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value ?? '');
            const isDimension = child.type === 'Dimension';
            const isPixelUnit = child.unit === 'px';
            const isWithinSizeTokenRange = value <= maxSizeToken.value && value >= minSizeToken.value;
            return isDimension && isPixelUnit && isWithinSizeTokenRange;
          });

          if (child) {
            const alternate = sizeTokens.find(token => token.value === parseInt(child.value ?? ''))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: property,
                alternate: alternate ?? 'var(--nve-ref-size-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value font-size
        if (propertyName === 'font-size') {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value ?? '');
            const isDimension = child.type === 'Dimension';
            const isPixelUnit = child.unit === 'px';
            const isWithinFontSizeTokenRange = value <= maxFontSizeToken.value && value >= minFontSizeToken.value;
            return isDimension && isPixelUnit && isWithinFontSizeTokenRange;
          });
          if (child) {
            const alternate = fontSizeTokens.find(token => token.value === parseInt(child.value ?? ''))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: property,
                alternate: alternate ?? 'var(--nve-ref-font-size-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value font-weight
        if (propertyName === 'font-weight') {
          const child = node.value.children?.find(child => child.name !== 'var');
          if (child) {
            const alternate = fontWeightTokens.find(
              token => token.value === child.value || token.value === child.name
            )?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value ?? '',
                unit: child.name ?? '',
                property: property,
                alternate: alternate ?? 'var(--nve-ref-font-weight-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value line-height
        if (propertyName === 'line-height') {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value ?? '');
            const isDimension = child.type === 'Dimension';
            const isPixelUnit = child.unit === 'px';
            const isWithinLineHeightTokenRange = value <= maxLineHeightToken.value && value >= minLineHeightToken.value;
            return isDimension && isPixelUnit && isWithinLineHeightTokenRange;
          });

          if (child) {
            const alternate = lineHeightTokens.find(token => token.value === parseInt(child.value ?? ''))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: property,
                alternate: alternate ?? 'var(--nve-ref-font-line-height-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value opacity
        if (propertyName === 'opacity') {
          const child = node.value.children?.find(
            child => child.type === 'Number' && child.value !== '0' && child.value !== '1'
          );

          if (child) {
            const alternate = opacityTokens.find(token => token.value === child.value)?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value ?? '',
                unit: child.unit ?? '',
                property: property,
                alternate: alternate ?? 'var(--nve-ref-opacity-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value border-radius
        if (propertyName === 'border-radius') {
          let value = '';
          let unit = '';

          const child = node.value.children?.find(child => {
            const value = parseInt(child.value ?? '');
            const isDimension = child.type === 'Dimension' && child.unit === 'px';
            const isNumber = child.type === 'Number' && child.unit === undefined;
            const isWithinBorderRadiusTokenRange =
              value <= maxBorderRadiusToken.value && value >= minBorderRadiusToken.value;
            return (isDimension || isNumber) && isWithinBorderRadiusTokenRange;
          });

          if (child) {
            value = child.value ?? '';
            unit = child.unit ?? '';
          }

          if (node.property.startsWith('--')) {
            const rawValue = node.value.value.trim();
            if (rawValue.includes('px')) {
              value = rawValue;
            }
          }

          if (value) {
            const alternate = borderRadiusTokens.find(token => token.value === parseInt(value))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value,
                unit,
                property: property,
                alternate: alternate ?? 'var(--nve-ref-border-radius-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value border-width
        if (propertyName === 'border-width') {
          const child = node.value.children?.find(child => {
            const value = parseInt(child.value ?? '');
            const isDimension = child.type === 'Dimension';
            const isPixelUnit = child.unit === 'px';
            const isWithinBorderWidthTokenRange =
              value <= maxBorderWidthToken.value && value >= minBorderWidthToken.value;
            return isDimension && isPixelUnit && isWithinBorderWidthTokenRange;
          });

          if (child) {
            const alternate = borderWidthTokens.find(token => token.value === parseInt(child.value ?? ''))?.name;
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: property,
                alternate: alternate ?? 'var(--nve-ref-border-width-*)'
              },
              fix: alternate ? fixer => fixer.replaceText(node, `${property}: ${alternate}`) : undefined
            });
          }
        }

        // unexpected-css-value box-shadow
        if (propertyName === 'box-shadow') {
          const child = node.value.children?.find(child => child.type === 'Dimension');

          if (child && !JSON.stringify(node.value).includes('Highlight')) {
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value: child.value,
                unit: child.unit,
                property: property,
                alternate: 'var(--nve-ref-shadow-*)'
              }
            });
          }
        }

        // unexpected-css-value color
        if (propertyName === 'color' || propertyName === 'background') {
          let value = '';
          let unit = '';

          const child = node.value.children?.find(
            child => child.type === 'Hash' || child.name?.includes('hsl') || child.name?.includes('rgb')
          );

          if (child) {
            value = child.type === 'Hash' ? `#${(child.value ?? '').trim()}` : child.name.trim();
            unit = child.type === 'Hash' ? '' : child.name.trim();
          }

          if (node.property.startsWith('--')) {
            const rawValue = node.value.value.trim();
            if (rawValue.includes('#') || rawValue.includes('hsl') || rawValue.includes('rgb')) {
              value = rawValue;
              unit = '';
            }
          }

          if (value) {
            context.report({
              messageId: 'unexpected-css-value',
              node,
              data: {
                value,
                unit,
                property: node.property,
                alternate: `var(--nve-*-${propertyName})`
              }
            });
          }
        }
      }
    };
  }
} as const;

export default rule;
