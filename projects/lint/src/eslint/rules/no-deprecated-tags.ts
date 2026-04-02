// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const DEPRECATED_TAGS: Record<string, string> = {
  // v1
  'nve-app-header': 'nve-page-header',
  'nve-alert-banner': 'nve-alert-group',
  'nve-json-view': 'nve-monaco-editor',
  // v0
  'mlv-accordion': 'nve-accordion',
  'mlv-accordion-content': 'nve-accordion-content',
  'mlv-accordion-group': 'nve-accordion-group',
  'mlv-accordion-header': 'nve-accordion-header',
  'mlv-alert': 'nve-alert',
  'mlv-alert-banner': 'nve-alert-banner',
  'mlv-alert-group': 'nve-alert-group',
  'mlv-app-header': 'nve-page-header',
  'mlv-badge': 'nve-badge',
  'mlv-breadcrumb': 'nve-breadcrumb',
  'mlv-button': 'nve-button',
  'mlv-button-group': 'nve-button-group',
  'mlv-card': 'nve-card',
  'mlv-card-content': 'nve-card-content',
  'mlv-card-footer': 'nve-card-footer',
  'mlv-card-header': 'nve-card-header',
  'mlv-checkbox': 'nve-checkbox',
  'mlv-checkbox-group': 'nve-checkbox-group',
  'mlv-color': 'nve-color',
  'mlv-combobox': 'nve-combobox',
  'mlv-control': 'nve-control',
  'mlv-control-group': 'nve-control-group',
  'mlv-control-message': 'nve-control-message',
  'mlv-date': 'nve-date',
  'mlv-datetime': 'nve-datetime',
  'mlv-dialog': 'nve-dialog',
  'mlv-dialog-footer': 'nve-dialog-footer',
  'mlv-dialog-header': 'nve-dialog-header',
  'mlv-divider': 'nve-divider',
  'mlv-dot': 'nve-dot',
  'mlv-drawer': 'nve-drawer',
  'mlv-drawer-content': 'nve-drawer-content',
  'mlv-drawer-footer': 'nve-drawer-footer',
  'mlv-drawer-header': 'nve-drawer-header',
  'mlv-dropdown': 'nve-dropdown',
  'mlv-dropdown-footer': 'nve-dropdown-footer',
  'mlv-dropdown-header': 'nve-dropdown-header',
  'mlv-file': 'nve-file',
  'mlv-grid': 'nve-grid',
  'mlv-grid-cell': 'nve-grid-cell',
  'mlv-grid-column': 'nve-grid-column',
  'mlv-grid-footer': 'nve-grid-footer',
  'mlv-grid-header': 'nve-grid-header',
  'mlv-grid-placeholder': 'nve-grid-placeholder',
  'mlv-grid-row': 'nve-grid-row',
  'mlv-icon': 'nve-icon',
  'mlv-icon-button': 'nve-icon-button',
  'mlv-input': 'nve-input',
  'mlv-input-group': 'nve-input-group',
  'mlv-logo': 'nve-logo',
  'mlv-menu': 'nve-menu',
  'mlv-menu-item': 'nve-menu-item',
  'mlv-month': 'nve-month',
  'mlv-notification': 'nve-notification',
  'mlv-notification-group': 'nve-notification-group',
  'mlv-page-loader': 'nve-page-loader',
  'mlv-pagination': 'nve-pagination',
  'mlv-panel': 'nve-page-panel',
  'mlv-panel-content': 'nve-page-panel-content',
  'mlv-panel-footer': 'nve-page-panel-footer',
  'mlv-panel-header': 'nve-page-panel-header',
  'mlv-password': 'nve-password',
  'mlv-progress-bar': 'nve-progress-bar',
  'mlv-progress-ring': 'nve-progress-ring',
  'mlv-progressive-filter-chip': 'nve-progressive-filter-chip',
  'mlv-radio': 'nve-radio',
  'mlv-radio-group': 'nve-radio-group',
  'mlv-range': 'nve-range',
  'mlv-search': 'nve-search',
  'mlv-select': 'nve-select',
  'mlv-sort-button': 'nve-sort-button',
  'mlv-steps': 'nve-steps',
  'mlv-steps-item': 'nve-steps-item',
  'mlv-switch': 'nve-switch',
  'mlv-switch-group': 'nve-switch-group',
  'mlv-tabs': 'nve-tabs',
  'mlv-tabs-item': 'nve-tabs-item',
  'mlv-tag': 'nve-tag',
  'mlv-textarea': 'nve-textarea',
  'mlv-time': 'nve-time',
  'mlv-toast': 'nve-toast',
  'mlv-toggletip': 'nve-toggletip',
  'mlv-toggletip-footer': 'nve-toggletip-footer',
  'mlv-toggletip-header': 'nve-toggletip-header',
  'mlv-toolbar': 'nve-toolbar',
  'mlv-tooltip': 'nve-tooltip',
  'mlv-week': 'nve-week'
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated elements in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-tag']: 'Unexpected use of deprecated tag <{{tag}}>. Use <{{replacement}}> instead.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const replacement = DEPRECATED_TAGS[node.name];
        if (replacement) {
          context.report({
            node,
            data: { tag: node.name, replacement },
            messageId: 'unexpected-deprecated-tag'
          });
        }
      }
    });
  }
} as const;

export default rule;
