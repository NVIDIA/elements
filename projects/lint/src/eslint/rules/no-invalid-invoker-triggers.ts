// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { defineRuleDocumentation } from '../rule-documentation.js';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { isNVElement } from '../internals/utils.js';
import type { HtmlTagNode } from '../rule-types.js';

/**
 * Invoker attributes supported by button controls and, for commandfor, command-only controls.
 */
const INVOKER_ATTRIBUTES = ['popovertarget', 'commandfor', 'interestfor'] as const;

/**
 * NVE elements that are button-type and can validly use invoker attributes.
 */
const BUTTON_TYPE_ELEMENTS = [
  'nve-button',
  'nve-icon-button',
  'nve-menu-item',
  'nve-sort-button',
  'nve-tabs-item',
  'nve-tag',
  'nve-steps-item',
  'nve-copy-button',
  'nve-media-fullscreen-button',
  'nve-media-mute-button',
  'nve-media-pause-button',
  'nve-media-seek-button'
] as const;

/** Controls that invoke commands without button, popover, or interest behavior. */
const COMMAND_CONTROLS = [
  'nve-media-playback-rate-select',
  'nve-media-time-range',
  'nve-media-volume-range',
  'nve-viewport-minimap',
  'nve-viewport-zoom-range'
] as const;

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-invalid-invoker-triggers',
      description: 'Disallow unsupported invoker trigger attributes on nve-* elements.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-button popovertarget="menu">Open</nve-button>',
        invalid: '<nve-badge popovertarget="menu">Open</nve-badge>'
      }
    }),
    schema: [],
    messages: {
      ['no-invalid-invoker-triggers']:
        'Unexpected use of "{{attribute}}" on <{{element}}>. Invoker attributes are only valid on supported controls: {{validElements}}.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();

        if (!isNVElement(tagName)) {
          return;
        }

        if (BUTTON_TYPE_ELEMENTS.includes(tagName as (typeof BUTTON_TYPE_ELEMENTS)[number])) {
          return;
        }

        for (const attribute of INVOKER_ATTRIBUTES) {
          if (attribute === 'commandfor' && COMMAND_CONTROLS.includes(tagName as (typeof COMMAND_CONTROLS)[number]))
            continue;
          const attr = findAttr(node, attribute);
          if (attr) {
            context.report({
              messageId: 'no-invalid-invoker-triggers',
              node: attr,
              data: {
                attribute,
                element: tagName,
                validElements: (attribute === 'commandfor'
                  ? [...BUTTON_TYPE_ELEMENTS, ...COMMAND_CONTROLS]
                  : BUTTON_TYPE_ELEMENTS
                ).join(', ')
              }
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
