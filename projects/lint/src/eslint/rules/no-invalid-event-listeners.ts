// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import type { HtmlAttribute, HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const INLINE_EVENT_HANDLER = /^on[a-z]+$/i;
const DATA_BINDING_PATTERNS = [
  /\$\{[^}]*\}/, // ${...} - JavaScript template literals
  /\{\{[^}]*\}\}/, // {{...}} - Vue, Angular, Handlebars
  /^\{[^}]+\}$/ // {...} - JSX/React expressions (entire value is an expression)
];

function hasDataBinding(attribute: HtmlAttribute): boolean {
  const value = attribute.value?.value;
  if (!value) return false;

  if (DATA_BINDING_PATTERNS.some(pattern => pattern.test(value))) {
    return true;
  }

  // NOTE: The HTML parser truncates unquoted JSX callbacks to a value beginning with "{".
  return !attribute.startWrapper && value.startsWith('{');
}

// Defer lint errors while developers are typing an event binding in the editor.
function isIncompleteEventHandler(attribute: HtmlAttribute, sourceText: string): boolean {
  if (attribute.value || !attribute.range || sourceText[attribute.range[1]] !== '=') {
    return false;
  }

  const value = sourceText.slice(attribute.range[1] + 1);
  if (!value) {
    return true;
  }

  if (value.startsWith('{') || value.startsWith('$')) {
    return true;
  }

  if (!value.startsWith('"')) {
    return false;
  }

  const quotedValue = value.slice(1);
  return !quotedValue || quotedValue.startsWith('{') || quotedValue.startsWith('$');
}

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
    const sourceText = context.sourceCode.getText();

    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        (node.attributes ?? []).forEach(attr => {
          if (attr.type !== 'Attribute' || !attr.key?.value) return;

          const name = attr.key.value;
          if (INLINE_EVENT_HANDLER.test(name) && !hasDataBinding(attr) && !isIncompleteEventHandler(attr, sourceText)) {
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
