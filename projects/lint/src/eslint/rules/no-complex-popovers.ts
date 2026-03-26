import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { hasTemplateSyntax, type HtmlNode } from '../internals/utils.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const POPOVER_MAX_NODES: Record<string, number> = {
  'nve-drawer': 100,
  'nve-dialog': 50,
  'nve-toggletip': 20,
  'nve-notification': 5,
  'nve-tooltip': 5,
  'nve-toast': 5
};

const EXCLUDED_TAGS = new Set(['option', 'li', 'tr', 'td', 'th', 'nve-grid-cell', 'nve-grid-row', 'nve-grid-column']);

const DISALLOWED_TAGS = new Set(['nve-page', 'nve-page-header', 'nve-page-sidebar', 'nve-card']);

function countElementNodes(node: HtmlNode): number {
  if (!node.children || !Array.isArray(node.children)) return 0;

  return node.children.reduce((count: number, child: HtmlNode) => {
    if (child.type === 'Tag') {
      const tag = child.name.toLowerCase();
      if (EXCLUDED_TAGS.has(tag)) {
        return count + countElementNodes(child);
      }
      return count + 1 + countElementNodes(child);
    }
    return count;
  }, 0);
}

function findDisallowedElements(node: HtmlNode): string[] {
  const found: string[] = [];

  function walk(n: HtmlNode) {
    if (n.type === 'Tag') {
      const tag = n.name.toLowerCase();
      if (DISALLOWED_TAGS.has(tag)) {
        found.push(tag);
      }
    }
    if (n.children && Array.isArray(n.children)) {
      n.children.forEach(walk);
    }
  }

  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(walk);
  }

  return [...new Set(found)];
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow excessive DOM complexity inside popover elements.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['complex-popover']:
        '<{{element}}> has {{count}} child elements (max {{max}}). Simplify the popover content for accessibility and UX.',
      ['disallowed-popover-child']:
        '<{{child}}> should not be used inside <{{element}}>. Popover content should be simple for accessibility and UX.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();
        const maxNodes = POPOVER_MAX_NODES[tagName];
        if (maxNodes === undefined) return;

        if (hasTemplateSyntax(node)) return;

        const disallowed = findDisallowedElements(node);
        for (const child of disallowed) {
          context.report({
            node,
            messageId: 'disallowed-popover-child',
            data: { child, element: tagName }
          });
        }

        const count = countElementNodes(node);
        if (count <= maxNodes) return;

        context.report({
          node,
          messageId: 'complex-popover',
          data: {
            element: tagName,
            count: String(count),
            max: String(maxNodes)
          }
        });
      }
    });
  }
} as const;

export default rule;
