import type { Rule } from 'eslint';
import { theme } from '@nvidia-elements/themes';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { CssDeclarationNode, HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
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
    if (match[1] && isUnknownNveVariable(match[1])) unknowns.add(match[1]);
  }
  for (const match of cssText.matchAll(VAR_ASSIGNMENT)) {
    if (match[1] && isUnknownNveVariable(match[1])) unknowns.add(match[1]);
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
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['unknown-css-var']: 'Unknown use of {{value}}. Use provided --nve-* theme variables instead.'
    }
  },
  create(context: Rule.RuleContext) {
    const cssVisitors = {
      Declaration(node: CssDeclarationNode) {
        const children = node.value.children
          ?.filter(child => child.name === 'var')
          ?.flatMap(child => child.children ?? [])
          ?.filter(child => child.name?.match(/^--nve-/) && !isGlobal(child.name!));

        const unknownReference = children?.find(
          child => child.name && theme[child.name.replace('--', '')] === undefined
        );
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
        StyleTag(node: HtmlTagNode) {
          const text = context.sourceCode.getText(node as unknown as Rule.Node);
          for (const name of findUnknownVariablesInText(text)) {
            context.report({ messageId: 'unknown-css-var', node, data: { value: name } });
          }
        },
        Tag(node: HtmlTagNode) {
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
