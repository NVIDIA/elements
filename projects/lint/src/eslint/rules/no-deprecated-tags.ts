import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import type { HtmlTagNode } from '../rule-types.js';

const DEPRECATED_TAGS: Record<string, string> = {
  // v1
  'nve-app-header': 'nve-page-header',
  'nve-alert-banner': 'nve-alert-group',
  'nve-json-view': 'nve-monaco-editor',
  // v0
  'nve-accordion': 'nve-accordion',
  'nve-accordion-content': 'nve-accordion-content',
  'nve-accordion-group': 'nve-accordion-group',
  'nve-accordion-header': 'nve-accordion-header',
  'nve-alert': 'nve-alert',
  'nve-alert-banner': 'nve-alert-banner',
  'nve-alert-group': 'nve-alert-group',
  'nve-app-header': 'nve-page-header',
  'nve-badge': 'nve-badge',
  'nve-breadcrumb': 'nve-breadcrumb',
  'nve-button': 'nve-button',
  'nve-button-group': 'nve-button-group',
  'nve-card': 'nve-card',
  'nve-card-content': 'nve-card-content',
  'nve-card-footer': 'nve-card-footer',
  'nve-card-header': 'nve-card-header',
  'nve-checkbox': 'nve-checkbox',
  'nve-checkbox-group': 'nve-checkbox-group',
  'nve-color': 'nve-color',
  'nve-combobox': 'nve-combobox',
  'nve-control': 'nve-control',
  'nve-control-group': 'nve-control-group',
  'nve-control-message': 'nve-control-message',
  'nve-date': 'nve-date',
  'nve-datetime': 'nve-datetime',
  'nve-dialog': 'nve-dialog',
  'nve-dialog-footer': 'nve-dialog-footer',
  'nve-dialog-header': 'nve-dialog-header',
  'nve-divider': 'nve-divider',
  'nve-dot': 'nve-dot',
  'nve-drawer': 'nve-drawer',
  'nve-drawer-content': 'nve-drawer-content',
  'nve-drawer-footer': 'nve-drawer-footer',
  'nve-drawer-header': 'nve-drawer-header',
  'nve-dropdown': 'nve-dropdown',
  'nve-dropdown-footer': 'nve-dropdown-footer',
  'nve-dropdown-header': 'nve-dropdown-header',
  'nve-file': 'nve-file',
  'nve-grid': 'nve-grid',
  'nve-grid-cell': 'nve-grid-cell',
  'nve-grid-column': 'nve-grid-column',
  'nve-grid-footer': 'nve-grid-footer',
  'nve-grid-header': 'nve-grid-header',
  'nve-grid-placeholder': 'nve-grid-placeholder',
  'nve-grid-row': 'nve-grid-row',
  'nve-icon': 'nve-icon',
  'nve-icon-button': 'nve-icon-button',
  'nve-input': 'nve-input',
  'nve-input-group': 'nve-input-group',
  'nve-logo': 'nve-logo',
  'nve-menu': 'nve-menu',
  'nve-menu-item': 'nve-menu-item',
  'nve-month': 'nve-month',
  'nve-notification': 'nve-notification',
  'nve-notification-group': 'nve-notification-group',
  'nve-page-loader': 'nve-page-loader',
  'nve-pagination': 'nve-pagination',
  'nve-panel': 'nve-page-panel',
  'nve-panel-content': 'nve-page-panel-content',
  'nve-panel-footer': 'nve-page-panel-footer',
  'nve-panel-header': 'nve-page-panel-header',
  'nve-password': 'nve-password',
  'nve-progress-bar': 'nve-progress-bar',
  'nve-progress-ring': 'nve-progress-ring',
  'nve-progressive-filter-chip': 'nve-progressive-filter-chip',
  'nve-radio': 'nve-radio',
  'nve-radio-group': 'nve-radio-group',
  'nve-range': 'nve-range',
  'nve-search': 'nve-search',
  'nve-select': 'nve-select',
  'nve-sort-button': 'nve-sort-button',
  'nve-steps': 'nve-steps',
  'nve-steps-item': 'nve-steps-item',
  'nve-switch': 'nve-switch',
  'nve-switch-group': 'nve-switch-group',
  'nve-tabs': 'nve-tabs',
  'nve-tabs-item': 'nve-tabs-item',
  'nve-tag': 'nve-tag',
  'nve-textarea': 'nve-textarea',
  'nve-time': 'nve-time',
  'nve-toast': 'nve-toast',
  'nve-toggletip': 'nve-toggletip',
  'nve-toggletip-footer': 'nve-toggletip-footer',
  'nve-toggletip-header': 'nve-toggletip-header',
  'nve-toolbar': 'nve-toolbar',
  'nve-tooltip': 'nve-tooltip',
  'nve-week': 'nve-week'
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated elements in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
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
