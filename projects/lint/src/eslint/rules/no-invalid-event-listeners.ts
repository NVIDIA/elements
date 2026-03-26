import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const INLINE_EVENT_HANDLER = /^on[a-z]+$/i;

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow inline event handler attributes in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['no-inline-event-handler']:
        'Unexpected inline event handler "{{attribute}}". Use addEventListener() or a framework event binding instead.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        (node.attributes ?? []).forEach(attr => {
          if (attr.type !== 'Attribute' || !attr.key?.value) return;

          const name = attr.key.value;
          if (INLINE_EVENT_HANDLER.test(name)) {
            context.report({
              node: attr,
              messageId: 'no-inline-event-handler',
              data: { attribute: name }
            });
          }
        });
      }
    });
  }
} as const;

export default rule;
