import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { type HtmlNode } from '../internals/utils.js';

/**
 * Patterns that show data binding in attribute values.
 * When these are present, we can't statically determine the value.
 */
const DATA_BINDING_PATTERNS = [
  /\$\{[^}]*\}/, // ${...} - JavaScript template literals
  /\{\{[^}]*\}\}/, // {{...}} - Vue, Angular, Handlebars
  /^\{[^}]+\}$/ // {...} - JSX/React expressions (entire value is an expression)
];

/**
 * Check if an attribute value contains data binding syntax.
 */
function hasDataBinding(value: string | undefined): boolean {
  if (!value) return false;
  return DATA_BINDING_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Find an attribute by name, including data binding variants.
 * Returns the attribute and whether it uses data binding.
 */
function findAttrWithBinding(
  node: HtmlNode,
  attrName: string
): { attr: ReturnType<typeof findAttr>; hasBinding: boolean } {
  // Check for standard attribute
  const standard = findAttr(node, attrName);
  if (standard) {
    return { attr: standard, hasBinding: hasDataBinding(standard.value?.value) };
  }

  // Check for Angular property binding: [attrName]
  const angularAttr = findAttr(node, `[${attrName}]`);
  if (angularAttr) {
    return { attr: angularAttr, hasBinding: true };
  }

  // Check for Lit property binding: .attrName
  const litAttr = findAttr(node, `.${attrName}`);
  if (litAttr) {
    return { attr: litAttr, hasBinding: true };
  }

  return { attr: undefined, hasBinding: false };
}

/**
 * Popover elements that require a trigger button with popovertarget or commandfor attribute.
 */
const POPOVER_ELEMENTS = [
  'nve-dropdown',
  'nve-tooltip',
  'nve-toggletip',
  'nve-dialog',
  'nve-drawer',
  'nve-toast',
  'nve-notification',
  'nve-notification-group'
] as const;

/**
 * Attributes that reference a popover target.
 */
const TRIGGER_ATTRIBUTES = ['popovertarget', 'commandfor'] as const;

interface PopoverNode {
  node: HtmlNode;
  id: string | undefined;
  hasBindingId: boolean;
  hasHidden: boolean;
  anchorAttr: { node: HtmlNode; value: string | undefined } | undefined;
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Require popover elements to have a corresponding trigger element.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['missing-popover-trigger']:
        'Popover element <{{tag}}> is missing a trigger element. Add a button with popovertarget="{{id}}" or commandfor="{{id}}". If programmatically controlling the popover with JavaScript, add a hidden attribute to the popover element.',
      ['missing-popover-id']:
        'Popover element <{{tag}}> is missing an id attribute. Add an id to enable trigger association.',
      ['empty-anchor-with-trigger']:
        'Popover element <{{tag}}> has an empty anchor attribute. Remove the anchor attribute as it will be automatically anchored to the trigger element.'
    }
  },
  create(context: Rule.RuleContext) {
    const popovers: PopoverNode[] = [];
    // Map from popover ID to trigger element ID
    const triggerMap = new Map<string, string>();
    // Track if any trigger uses data binding (could match any popover)
    let hasDynamicTrigger = false;

    function collectTriggerInfo(node: HtmlNode) {
      for (const attr of TRIGGER_ATTRIBUTES) {
        const { attr: found, hasBinding } = findAttrWithBinding(node, attr);
        if (!found) continue;
        if (hasBinding) {
          hasDynamicTrigger = true;
        } else if (found.value?.value) {
          const triggerId = findAttr(node, 'id')?.value?.value;
          triggerMap.set(found.value.value, triggerId ?? found.value.value);
        }
      }
    }

    function collectPopoverInfo(node: HtmlNode) {
      const tagName = node.name.toLowerCase();
      if (!POPOVER_ELEMENTS.includes(tagName as (typeof POPOVER_ELEMENTS)[number])) return;
      const { attr: idAttr, hasBinding: hasBindingId } = findAttrWithBinding(node, 'id');
      const anchorAttr = findAttr(node, 'anchor');
      const hiddenAttr = findAttr(node, 'hidden');
      popovers.push({
        node,
        id: idAttr?.value?.value,
        hasBindingId,
        hasHidden: !!hiddenAttr,
        anchorAttr: anchorAttr ? { node: anchorAttr, value: anchorAttr.value?.value } : undefined
      });
    }

    function validatePopover(popover: PopoverNode) {
      if (popover.hasBindingId || hasDynamicTrigger || popover.hasHidden) return;
      const hasTrigger = popover.id && triggerMap.has(popover.id);

      if (!popover.id) {
        context.report({ node: popover.node, messageId: 'missing-popover-id', data: { tag: popover.node.name } });
      } else if (!hasTrigger) {
        context.report({
          node: popover.node,
          messageId: 'missing-popover-trigger',
          data: { tag: popover.node.name, id: popover.id }
        });
      }

      if (hasTrigger && popover.anchorAttr && !popover.anchorAttr.value) {
        context.report({
          node: popover.anchorAttr.node,
          messageId: 'empty-anchor-with-trigger',
          data: { tag: popover.node.name }
        });
      }
    }

    return createVisitors(context, {
      Tag(node: HtmlNode) {
        collectTriggerInfo(node);
        collectPopoverInfo(node);
      },
      'Program:exit'() {
        for (const popover of popovers) {
          validatePopover(popover);
        }
      }
    });
  }
} as const;

export default rule;
