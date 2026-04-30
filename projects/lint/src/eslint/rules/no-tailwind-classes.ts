// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { VALUE_BINDINGS } from '../internals/attributes.js';
import {
  HINTS,
  isAllowedNveHostTailwindToken,
  isTailwindToken,
  stripVariantsAndModifiers
} from '../internals/tailwind.js';
import type { HtmlAttribute, HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description:
        'Reports Tailwind classes that conflict with Elements styling. Strict mode reports any Tailwind-shaped class.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [
      {
        type: 'object',
        properties: {
          strict: {
            type: 'boolean',
            default: false,
            description:
              'When true, reports any Tailwind-shaped class on any element. When false, only reports problematic Tailwind classes on nve-* elements while allowing host-level visibility, positioning, margin, and flex-item utilities.'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      ['no-tailwind-class']:
        'Unexpected Tailwind class "{{tailwindClass}}" on <{{tagName}}>. Use Elements global attributes (nve-layout, nve-text, nve-display) or Elements components instead.',
      ['no-tailwind-class-with-suggestion']:
        'Unexpected Tailwind class "{{tailwindClass}}" on <{{tagName}}>. Use {{suggestion}} instead.',
      ['no-tailwind-class-on-nve-element']:
        'Unexpected Tailwind class "{{tailwindClass}}" on <{{tagName}}>. nve-* components do not support Tailwind utilities — use component-specific APIs instead.'
    }
  },
  create(context: Rule.RuleContext) {
    const strict = (context.options[0] as { strict?: boolean } | undefined)?.strict === true;

    function isDynamicToken(token: string) {
      return VALUE_BINDINGS.some(binding => token.includes(binding));
    }

    function reportToken({
      classAttr,
      tagName,
      token,
      isNveTag
    }: {
      classAttr: HtmlAttribute;
      tagName: string;
      token: string;
      isNveTag: boolean;
    }) {
      const bare = stripVariantsAndModifiers(token);
      const suggestion = HINTS[bare];
      const isKnownTailwindToken = Boolean(suggestion) || isTailwindToken(bare);

      if (isNveTag) {
        if (isKnownTailwindToken && (strict || !isAllowedNveHostTailwindToken(bare))) {
          context.report({
            node: classAttr,
            messageId: 'no-tailwind-class-on-nve-element',
            data: { tailwindClass: token, tagName }
          });
        }
        return;
      }

      if (strict && suggestion) {
        context.report({
          node: classAttr,
          messageId: 'no-tailwind-class-with-suggestion',
          data: { tailwindClass: token, tagName, suggestion }
        });
        return;
      }

      if (strict && isKnownTailwindToken) {
        context.report({
          node: classAttr,
          messageId: 'no-tailwind-class',
          data: { tailwindClass: token, tagName }
        });
      }
    }

    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const classAttr = findAttr(node, 'class');
        if (!classAttr) return;

        const value = classAttr.value?.value ?? '';
        if (!value.trim()) return;

        const isNveTag = node.name?.toLowerCase().startsWith('nve-') ?? false;
        const tagName = node.name;

        for (const token of value.split(/\s+/).filter(Boolean)) {
          if (isDynamicToken(token)) continue;
          reportToken({ classAttr, tagName, token, isNveTag });
        }
      }
    });
  }
} as const;

export default rule;
