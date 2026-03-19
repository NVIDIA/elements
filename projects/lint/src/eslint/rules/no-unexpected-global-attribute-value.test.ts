// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import html from '@html-eslint/eslint-plugin';
import noUnexpectedGlobalAttributeValue, {
  SIMPLE_NVE_TEXT_VALUES,
  SIMPLE_NVE_LAYOUT_VALUES,
  SIMPLE_NVE_DISPLAY_VALUES
} from './no-unexpected-global-attribute-value.js';

const rule = noUnexpectedGlobalAttributeValue as unknown as JSRuleDefinition;

const textValidValues = SIMPLE_NVE_TEXT_VALUES.map(v => `"${v}"`).join(', ');
const layoutValidValues = SIMPLE_NVE_LAYOUT_VALUES.map(v => `"${v}"`).join(', ');
const displayValidValues = SIMPLE_NVE_DISPLAY_VALUES.map(v => `"${v}"`).join(', ');

describe('noUnexpectedAttributeValue', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      language: 'html/html',
      languageOptions: {
        tolerant: true
      },
      plugins: {
        html
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noUnexpectedGlobalAttributeValue.meta).toBeDefined();
    expect(noUnexpectedGlobalAttributeValue.meta.type).toBe('problem');
    expect(noUnexpectedGlobalAttributeValue.meta.docs).toBeDefined();
    expect(noUnexpectedGlobalAttributeValue.meta.docs.description).toBe(
      'Disallow use of invalid attribute values in HTML.'
    );
    expect(noUnexpectedGlobalAttributeValue.meta.docs.category).toBe('Best Practice');
    expect(noUnexpectedGlobalAttributeValue.meta.docs.recommended).toBe(true);
    expect(noUnexpectedGlobalAttributeValue.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noUnexpectedGlobalAttributeValue.meta.schema).toBeDefined();
    expect(noUnexpectedGlobalAttributeValue.meta.messages).toBeDefined();
    expect(noUnexpectedGlobalAttributeValue.meta.messages['unexpected-attribute-value']).toBe(
      'Unexpected value "{{value}}" in "{{attribute}}" attribute. Available values: {{validValues}}'
    );
    expect(noUnexpectedGlobalAttributeValue.meta.messages['unexpected-attribute-value-alternative']).toBe(
      'Unexpected value "{{value}}" in "{{attribute}}" attribute. Use "{{alternative}}" instead.'
    );
  });

  it('should allow valid use of nve-text attribute values', () => {
    tester.run('should allow valid use of nve-text attribute values', rule, {
      valid: [
        '<h2 nve-text="heading"></h2>',
        '<h2 nve-text="heading sm muted"></h2>',
        '<p nve-text="body"></p>',
        '<p nve-text="body sm muted"></p>',
        '<span nve-text="${heading}"></span>',
        '<span nve-text=${heading}></span>',
        '<span nve-text={{heading}}></span>',
        '<span nve-text={%heading%}></span>'
      ],
      invalid: []
    });
  });

  it('should not allow invalid use of nve-text attribute values', () => {
    tester.run('should not allow invalid use of nve-text attribute values', rule, {
      valid: [],
      invalid: [
        {
          code: '<h2 nve-text="heading-1"></h2>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { attribute: 'nve-text', value: 'heading-1', alternative: 'heading' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'heading-1', alternative: 'heading' },
                  output: '<h2 nve-text="heading"></h2>'
                }
              ]
            }
          ]
        },
        {
          code: '<h2 nve-text="heading-1 sm muted"></h2>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { attribute: 'nve-text', value: 'heading-1 sm muted', alternative: 'heading sm muted' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'heading-1 sm muted', alternative: 'heading sm muted' },
                  output: '<h2 nve-text="heading sm muted"></h2>'
                }
              ]
            }
          ]
        },
        {
          code: '<p nve-text="default"></p>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { attribute: 'nve-text', value: 'default', alternative: 'body' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'default', alternative: 'body' },
                  output: '<p nve-text="body"></p>'
                }
              ]
            }
          ]
        },
        {
          code: '<p nve-text="unknown"></p>',
          errors: [
            {
              messageId: 'unexpected-attribute-value',
              data: { attribute: 'nve-text', value: 'unknown', validValues: textValidValues },
              suggestions: []
            }
          ]
        },
        {
          code: '<p nve-text="unknown sm muted"></p>',
          errors: [
            {
              messageId: 'unexpected-attribute-value',
              data: { attribute: 'nve-text', value: 'unknown sm muted', validValues: textValidValues },
              suggestions: []
            }
          ]
        }
      ]
    });
  });

  it('should allow valid use of nve-layout attribute values', () => {
    tester.run('should allow valid use of nve-layout attribute values', rule, {
      valid: [
        '<div nve-layout="row"></div>',
        '<div nve-layout="row gap:sm"></div>',
        '<div nve-layout="column"></div>',
        '<div nve-layout="column gap:sm"></div>',
        '<div nve-layout="${layout}"></div>',
        '<div nve-layout=${layout}></div>',
        '<div nve-layout={{layout}}></div>',
        '<div nve-layout={%layout%}></div>'
      ],
      invalid: []
    });
  });

  it('should not allow invalid use of nve-layout attribute values', () => {
    tester.run('should not allow invalid use of nve-layout attribute values', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-layout="unknown"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value',
              data: { attribute: 'nve-layout', value: 'unknown', validValues: layoutValidValues },
              suggestions: []
            }
          ]
        },
        {
          code: '<div nve-layout="grid gap:md grid-cols:4 flex:1"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value',
              data: {
                attribute: 'nve-layout',
                value: 'grid gap:md grid-cols:4 flex:1',
                validValues: layoutValidValues
              },
              suggestions: []
            }
          ]
        },
        {
          code: '<div nve-layout="stack"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { attribute: 'nve-layout', value: 'stack', alternative: 'column' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'stack', alternative: 'column' },
                  output: '<div nve-layout="column"></div>'
                }
              ]
            }
          ]
        },
        {
          code: '<div nve-layout="default"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { attribute: 'nve-layout', value: 'default', alternative: 'column' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'default', alternative: 'column' },
                  output: '<div nve-layout="column"></div>'
                }
              ]
            }
          ]
        },
        {
          code: '<div nve-layout="col"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { attribute: 'nve-layout', value: 'col', alternative: 'column' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'col', alternative: 'column' },
                  output: '<div nve-layout="column"></div>'
                }
              ]
            }
          ]
        },
        {
          code: '<div nve-layout="col gap:sm"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { attribute: 'nve-layout', value: 'col gap:sm', alternative: 'column gap:sm' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'col gap:sm', alternative: 'column gap:sm' },
                  output: '<div nve-layout="column gap:sm"></div>'
                }
              ]
            }
          ]
        },
        {
          code: '<div nve-layout="row padding:sm"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { attribute: 'nve-layout', value: 'row padding:sm', alternative: 'row pad:sm' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'row padding:sm', alternative: 'row pad:sm' },
                  output: '<div nve-layout="row pad:sm"></div>'
                }
              ]
            }
          ]
        },
        {
          code: '<div nve-layout="row wrap"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: { attribute: 'nve-layout', value: 'row wrap', alternative: 'row align:wrap' },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'row wrap', alternative: 'row align:wrap' },
                  output: '<div nve-layout="row align:wrap"></div>'
                }
              ]
            }
          ]
        },
        {
          code: '<div nve-layout="row gap:md align-items:center"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: {
                attribute: 'nve-layout',
                value: 'row gap:md align-items:center',
                alternative: 'row gap:md align:center'
              },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'row gap:md align-items:center', alternative: 'row gap:md align:center' },
                  output: '<div nve-layout="row gap:md align:center"></div>'
                }
              ]
            }
          ]
        },
        {
          code: '<div nve-layout="grid gap:md grid-cols:4"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value-alternative',
              data: {
                attribute: 'nve-layout',
                value: 'grid gap:md grid-cols:4',
                alternative: 'grid gap:md span-items:4'
              },
              suggestions: [
                {
                  messageId: 'suggest-replace-attribute-value',
                  data: { value: 'grid gap:md grid-cols:4', alternative: 'grid gap:md span-items:4' },
                  output: '<div nve-layout="grid gap:md span-items:4"></div>'
                }
              ]
            }
          ]
        }
      ]
    });
  });

  it('should not allow additional invalid symbols in nve-layout attribute values', () => {
    const validValues = SIMPLE_NVE_LAYOUT_VALUES.map(v => `"${v}"`).join(', ');

    tester.run('should not allow additional invalid symbols in nve-layout attribute values', rule, {
      valid: [],
      invalid: [
        {
          options: [{ 'nve-layout': ['&'] }],
          code: '<div nve-layout="row &lg|row"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value',
              data: { attribute: 'nve-layout', value: 'row &lg|row', validValues }
            }
          ]
        },
        {
          options: [{ 'nve-layout': ['|'] }],
          code: '<div nve-layout="row &lg|row"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value',
              data: { attribute: 'nve-layout', value: 'row &lg|row', validValues }
            }
          ]
        },
        {
          options: [{ 'nve-layout': ['|'] }],
          code: '<div nve-layout="row @lg|row"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value',
              data: { attribute: 'nve-layout', value: 'row @lg|row', validValues }
            }
          ]
        }
      ]
    });
  });

  it('should not allow invalid use of nve-display attribute values', () => {
    tester.run('should not allow invalid use of nve-display attribute values', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-display="row"></div>',
          errors: [
            {
              messageId: 'unexpected-attribute-value',
              data: { attribute: 'nve-display', value: 'row', validValues: displayValidValues }
            }
          ]
        }
      ]
    });
  });
});
