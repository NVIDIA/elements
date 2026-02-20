import { theme } from '@nvidia-elements/themes';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

// internal/private theme variables
const globals = new Set([
  '--nve-debug-outline-width',
  '--nve-debug-element-outline',
  '--nve-debug-typography-outline',
  '--nve-debug-layout-outline'
]);

const VAR_REFERENCE = /var\(\s*(--nve-[\w-]+)/g;
const VAR_ASSIGNMENT = /(--nve-[\w-]+)\s*:/g;

function isGlobal(name: string) {
  return globals.has(name) || name.startsWith('--nve-config-');
}

function isUnknownNveVariable(name: string) {
  return /^--nve-/.test(name) && !isGlobal(name) && theme[name.replace('--', '')] === undefined;
}

function findUnknownVariablesInText(cssText: string): string[] {
  const unknowns = new Set<string>();
  for (const match of cssText.matchAll(VAR_REFERENCE)) {
    if (isUnknownNveVariable(match[1])) unknowns.add(match[1]);
  }
  for (const match of cssText.matchAll(VAR_ASSIGNMENT)) {
    if (isUnknownNveVariable(match[1])) unknowns.add(match[1]);
  }
  return [...unknowns];
}

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
    const cssVisitors = {
      Declaration(node) {
        const children = node.value.children
          ?.filter(child => child.name === 'var')
          ?.flatMap(child => child.children)
          ?.filter(child => child.name && child.name.match(/^--nve-/) && !isGlobal(child.name));

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
          !isGlobal(node.property) &&
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

    try {
      const htmlVisitors = createVisitors(context, {
        StyleTag(node) {
          const text = context.sourceCode.getText(node);
          for (const name of findUnknownVariablesInText(text)) {
            context.report({ messageId: 'unknown-css-var', node, data: { value: name } });
          }
        },
        Tag(node) {
          const styleAttr = findAttr(node, 'style');
          if (!styleAttr?.value?.value) return;
          for (const name of findUnknownVariablesInText(styleAttr.value.value)) {
            context.report({ messageId: 'unknown-css-var', node: styleAttr, data: { value: name } });
          }
        }
      });
      return { ...cssVisitors, ...htmlVisitors };
    } catch {
      return cssVisitors;
    }
  }
};

export default rule;
