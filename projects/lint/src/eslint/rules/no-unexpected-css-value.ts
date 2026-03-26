import type { Rule } from 'eslint';
import { theme } from '@nvidia-elements/themes';
import type { CssDeclarationNode, CssValueChild } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
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

type TokenEntry = { id?: string; value: number | string; name: string };

function findPixelDimensionChild(
  node: CssDeclarationNode,
  min: number,
  max: number,
  extraCheck?: (v: number) => boolean
) {
  return node.value.children?.find(child => {
    const value = parseInt(child.value ?? '');
    const isMatch = child.type === 'Dimension' && child.unit === 'px' && value <= max && value >= min;
    return isMatch && (!extraCheck || extraCheck(value));
  });
}

function reportTokenViolation(
  context: Rule.RuleContext,
  node: CssDeclarationNode,
  data: { value: string; unit: string; alternate: string }
) {
  const { alternate } = data;
  const hasAlternate =
    !alternate.includes('*') && (alternate.includes('var(--nve-ref-') || alternate.includes('var(--nve-sys-'));
  context.report({
    messageId: 'unexpected-css-value',
    node,
    data: { ...data, property: node.property },
    fix: hasAlternate ? fixer => fixer.replaceText(node, `${node.property}: ${alternate}`) : undefined
  });
}

function findTokenAlternate(tokens: TokenEntry[], value: number): string | undefined {
  return tokens.find(token => token.value === value)?.name;
}

function checkDimensionProperty(
  context: Rule.RuleContext,
  node: CssDeclarationNode,
  min: number,
  max: number,
  tokens: TokenEntry[],
  fallback: string,
  extraCheck?: (v: number) => boolean
) {
  const child = findPixelDimensionChild(node, min, max, extraCheck);
  if (!child) return;
  const alternate = findTokenAlternate(tokens, parseInt(child.value ?? '')) ?? fallback;
  reportTokenViolation(context, node, { value: child.value ?? '', unit: child.unit ?? '', alternate });
}

function checkSpaceValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (!propertyName.includes('margin') && !propertyName.includes('gap')) return;
  checkDimensionProperty(
    context,
    node,
    minSpaceToken.value,
    maxSpaceToken.value,
    spaceTokens,
    'var(--nve-ref-space-*)',
    v => v !== 1
  );
}

function checkSizeValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (propertyName !== 'width' && propertyName !== 'height') return;
  checkDimensionProperty(context, node, minSizeToken.value, maxSizeToken.value, sizeTokens, 'var(--nve-ref-size-*)');
}

function checkFontSizeValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (propertyName !== 'font-size') return;
  checkDimensionProperty(
    context,
    node,
    minFontSizeToken.value,
    maxFontSizeToken.value,
    fontSizeTokens,
    'var(--nve-ref-font-size-*)'
  );
}

function checkFontWeightValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (propertyName !== 'font-weight') return;
  const child = node.value.children?.find(child => child.name !== 'var');
  if (!child) return;
  const alternate =
    fontWeightTokens.find(token => token.value === child.value || token.value === child.name)?.name ??
    'var(--nve-ref-font-weight-*)';
  reportTokenViolation(context, node, { value: child.value ?? '', unit: child.name ?? '', alternate });
}

function checkLineHeightValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (propertyName !== 'line-height') return;
  checkDimensionProperty(
    context,
    node,
    minLineHeightToken.value,
    maxLineHeightToken.value,
    lineHeightTokens,
    'var(--nve-ref-font-line-height-*)'
  );
}

function checkOpacityValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (propertyName !== 'opacity') return;
  const child = node.value.children?.find(
    child => child.type === 'Number' && child.value !== '0' && child.value !== '1'
  );
  if (!child) return;
  const alternate = opacityTokens.find(token => token.value === child.value)?.name ?? 'var(--nve-ref-opacity-*)';
  reportTokenViolation(context, node, { value: child.value ?? '', unit: child.unit ?? '', alternate });
}

function checkBorderRadiusValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (propertyName !== 'border-radius') return;
  let value = '';
  let unit = '';

  const child = node.value.children?.find(child => {
    const v = parseInt(child.value ?? '');
    const isDimensionOrNumber =
      (child.type === 'Dimension' && child.unit === 'px') || (child.type === 'Number' && child.unit === undefined);
    return isDimensionOrNumber && v <= maxBorderRadiusToken.value && v >= minBorderRadiusToken.value;
  });

  if (child) {
    value = child.value ?? '';
    unit = child.unit ?? '';
  }

  if (node.property.startsWith('--') && node.value.value.trim().includes('px')) {
    value = node.value.value.trim();
  }

  if (!value) return;
  const alternate = findTokenAlternate(borderRadiusTokens, parseInt(value)) ?? 'var(--nve-ref-border-radius-*)';
  reportTokenViolation(context, node, { value, unit, alternate });
}

function checkBorderWidthValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (propertyName !== 'border-width') return;
  checkDimensionProperty(
    context,
    node,
    minBorderWidthToken.value,
    maxBorderWidthToken.value,
    borderWidthTokens,
    'var(--nve-ref-border-width-*)'
  );
}

function checkBoxShadowValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (propertyName !== 'box-shadow') return;
  const child = node.value.children?.find(child => child.type === 'Dimension');
  if (!child || JSON.stringify(node.value).includes('Highlight')) return;
  context.report({
    messageId: 'unexpected-css-value',
    node,
    data: { value: child.value, unit: child.unit, property: node.property, alternate: 'var(--nve-ref-shadow-*)' }
  });
}

const COLOR_PATTERNS = ['#', 'hsl', 'rgb'];

function isColorFunctionChild(child: CssValueChild): boolean {
  return child.type === 'Hash' || child.name?.includes('hsl') === true || child.name?.includes('rgb') === true;
}

function extractColorFromChild(child: CssValueChild): { value: string; unit: string } {
  if (child.type === 'Hash') {
    return { value: `#${(child.value ?? '').trim()}`, unit: '' };
  }
  return { value: child.name.trim(), unit: child.name.trim() };
}

function extractColorFromCustomProperty(node: CssDeclarationNode): { value: string; unit: string } | undefined {
  if (!node.property.startsWith('--')) return undefined;
  const rawValue = node.value.value.trim();
  if (COLOR_PATTERNS.some(p => rawValue.includes(p))) {
    return { value: rawValue, unit: '' };
  }
  return undefined;
}

function checkColorValue(context: Rule.RuleContext, node: CssDeclarationNode, propertyName: string) {
  if (propertyName !== 'color' && propertyName !== 'background') return;

  const child = node.value.children?.find(isColorFunctionChild);
  const fromChild = child ? extractColorFromChild(child) : undefined;
  const fromCustomProp = extractColorFromCustomProperty(node);
  const result = fromCustomProp ?? fromChild;

  if (!result) return;
  context.report({
    messageId: 'unexpected-css-value',
    node,
    data: { value: result.value, unit: result.unit, property: node.property, alternate: `var(--nve-*-${propertyName})` }
  });
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of invalid CSS values.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
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
        const propertyName = node.property.replace('--', '');
        checkSpaceValue(context, node, propertyName);
        checkSizeValue(context, node, propertyName);
        checkFontSizeValue(context, node, propertyName);
        checkFontWeightValue(context, node, propertyName);
        checkLineHeightValue(context, node, propertyName);
        checkOpacityValue(context, node, propertyName);
        checkBorderRadiusValue(context, node, propertyName);
        checkBorderWidthValue(context, node, propertyName);
        checkBoxShadowValue(context, node, propertyName);
        checkColorValue(context, node, propertyName);
      }
    };
  }
} as const;

export default rule;
