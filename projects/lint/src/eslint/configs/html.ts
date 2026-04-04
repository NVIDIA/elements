// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Linter } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noComplexPopovers from '../rules/no-complex-popovers.js';
import noDeprecatedTags from '../rules/no-deprecated-tags.js';
import noDeprecatedAttributes from '../rules/no-deprecated-attributes.js';
import noDeprecatedIconNames from '../rules/no-deprecated-icon-names.js';
import noDeprecatedPopoverAttributes from '../rules/no-deprecated-popover-attributes.js';
import noUnexpectedGlobalAttributeValue from '../rules/no-unexpected-global-attribute-value.js';
import noUnexpectedStyleCustomization from '../rules/no-unexpected-style-customization.js';
import noDeprecatedGlobalAttributes from '../rules/no-deprecated-global-attributes.js';
import noRestrictedAttributes from '../rules/no-restricted-attributes.js';
import noDeprecatedSlots from '../rules/no-deprecated-slots.js';
import noMissingSlottedElements from '../rules/no-missing-slotted-elements.js';
import noMissingControlLabel from '../rules/no-missing-control-label.js';
import noMissingIconName from '../rules/no-missing-icon-name.js';
import noMissingPopoverTrigger from '../rules/no-missing-popover-trigger.js';
import noUnexpectedSlotValue from '../rules/no-unexpected-slot-value.js';
import noUnknownTags from '../rules/no-unknown-tags.js';
import noUnexpectedAttributeValue from '../rules/no-unexpected-attribute-value.js';
import noUnexpectedInputType from '../rules/no-unexpected-input-type.js';
import noInvalidEventListeners from '../rules/no-invalid-event-listeners.js';
import noInvalidInvokerTriggers from '../rules/no-invalid-invoker-triggers.js';
import noMissingGapSpace from '../rules/no-missing-gap-space.js';
import noUnknownCssVariable from '../rules/no-unknown-css-variable.js';
import noRestrictedPageSizing from '../rules/no-restricted-page-sizing.js';
import noNestedContainerTypes from '../rules/no-nested-container-types.js';
import noUnstyledTypography from '../rules/no-unstyled-typography.js';

const source = ['src/**/*.html', 'src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx'];

const ignores = [
  'node_modules/',
  'coverage/',
  'dist/',
  'build/',
  'src/vendor/',
  '.visual/',
  '.lighthouse/',
  '.wireit/',
  '.11ty-vite/',
  'src/**/*.snippets.html'
];

export const elementsHtmlConfig: Linter.Config = {
  files: [...source],
  ignores,
  languageOptions: {
    parser: htmlParser,
    parserOptions: {
      frontmatter: true
    }
  },
  plugins: {
    '@nvidia-elements/lint': {
      rules: {
        'no-complex-popovers': noComplexPopovers,
        'no-deprecated-tags': noDeprecatedTags,
        'no-deprecated-attributes': noDeprecatedAttributes,
        'no-deprecated-icon-names': noDeprecatedIconNames,
        'no-deprecated-popover-attributes': noDeprecatedPopoverAttributes,
        'no-deprecated-global-attributes': noDeprecatedGlobalAttributes,
        'no-deprecated-slots': noDeprecatedSlots,
        'no-missing-slotted-elements': noMissingSlottedElements,
        'no-missing-control-label': noMissingControlLabel,
        'no-missing-icon-name': noMissingIconName,
        'no-missing-popover-trigger': noMissingPopoverTrigger,
        'no-restricted-attributes': noRestrictedAttributes,
        'no-restricted-page-sizing': noRestrictedPageSizing,
        'no-unexpected-global-attribute-value': noUnexpectedGlobalAttributeValue,
        'no-unexpected-style-customization': noUnexpectedStyleCustomization,
        'no-unexpected-slot-value': noUnexpectedSlotValue,
        'no-unknown-tags': noUnknownTags,
        'no-unexpected-attribute-value': noUnexpectedAttributeValue,
        'no-unexpected-input-type': noUnexpectedInputType,
        'no-invalid-event-listeners': noInvalidEventListeners,
        'no-invalid-invoker-triggers': noInvalidInvokerTriggers,
        'no-missing-gap-space': noMissingGapSpace,
        'no-unknown-css-variable': noUnknownCssVariable,
        'no-nested-container-types': noNestedContainerTypes,
        'no-unstyled-typography': noUnstyledTypography
      }
    }
  },
  rules: {
    '@nvidia-elements/lint/no-complex-popovers': ['error'],
    '@nvidia-elements/lint/no-unexpected-style-customization': ['off'],
    '@nvidia-elements/lint/no-deprecated-tags': ['error'],
    '@nvidia-elements/lint/no-deprecated-attributes': ['error'],
    '@nvidia-elements/lint/no-deprecated-icon-names': ['error'],
    '@nvidia-elements/lint/no-deprecated-popover-attributes': ['error'],
    '@nvidia-elements/lint/no-deprecated-global-attributes': ['error'],
    '@nvidia-elements/lint/no-deprecated-slots': ['error'],
    '@nvidia-elements/lint/no-missing-slotted-elements': ['error'],
    '@nvidia-elements/lint/no-missing-control-label': ['error'],
    '@nvidia-elements/lint/no-missing-icon-name': ['error'],
    '@nvidia-elements/lint/no-missing-popover-trigger': ['error'],
    '@nvidia-elements/lint/no-restricted-attributes': ['error'],
    '@nvidia-elements/lint/no-restricted-page-sizing': ['error'],
    '@nvidia-elements/lint/no-unexpected-global-attribute-value': ['error'],
    '@nvidia-elements/lint/no-unexpected-slot-value': ['error'],
    '@nvidia-elements/lint/no-unknown-tags': ['error'],
    '@nvidia-elements/lint/no-unexpected-attribute-value': ['error'],
    '@nvidia-elements/lint/no-unexpected-input-type': ['error'],
    '@nvidia-elements/lint/no-invalid-event-listeners': ['error'],
    '@nvidia-elements/lint/no-invalid-invoker-triggers': ['error'],
    '@nvidia-elements/lint/no-missing-gap-space': ['off'],
    '@nvidia-elements/lint/no-unknown-css-variable': ['error'],
    '@nvidia-elements/lint/no-nested-container-types': ['error'],
    '@nvidia-elements/lint/no-unstyled-typography': ['error']
  }
};
