// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noRestrictedAttributes from './no-restricted-attributes.js';
import { getElementAttributeNames } from '../internals/element-attributes.js';

const rule = noRestrictedAttributes as unknown as JSRuleDefinition;

function supportedAttrs(tagName: string) {
  return getElementAttributeNames(tagName)
    .map(a => `"${a}"`)
    .join(', ');
}

describe('noRestrictedAttributes', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      languageOptions: {
        parser: htmlParser
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noRestrictedAttributes.meta).toBeDefined();
    expect(noRestrictedAttributes.meta.type).toBe('problem');
    expect(noRestrictedAttributes.meta.docs).toBeDefined();
    expect(noRestrictedAttributes.meta.docs.description).toBe(
      'Disallow use of invalid API attributes or utility attributes on custom HTML element tags.'
    );
    expect(noRestrictedAttributes.meta.docs.category).toBe('Best Practice');
    expect(noRestrictedAttributes.meta.docs.recommended).toBe(true);
    expect(noRestrictedAttributes.meta.docs.url).toContain('/docs/lint/');
    expect(noRestrictedAttributes.meta.schema).toEqual([]);
    expect(noRestrictedAttributes.meta.messages).toBeDefined();
    expect(noRestrictedAttributes.meta.messages['no-restricted-attributes']).toBe(
      'Unexpected use of restricted attribute "{{attribute}}" on <{{element}}>. Remove the attribute.'
    );
    expect(noRestrictedAttributes.meta.messages['no-restricted-attributes-with-supported']).toBe(
      'Unexpected use of restricted attribute "{{attribute}}" on <{{element}}>. Remove the attribute. Supported attributes: {{supportedAttributes}}'
    );
  });

  it('should allow global utility attributes on native HTML elements', () => {
    tester.run('allow utility attributes on native elements', rule, {
      valid: [
        '<div nve-layout="row"></div>',
        '<p nve-text="body"></p>',
        '<span nve-text="caption"></span>',
        '<section nve-layout="column"></section>',
        '<div mlv-layout="row"></div>',
        '<p mlv-text="body"></p>'
      ],
      invalid: []
    });
  });

  it('should report nve-layout on custom elements', () => {
    tester.run('nve-layout on custom elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-button nve-layout="pad:md"></nve-button>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: {
                attribute: 'nve-layout',
                element: 'nve-button',
                supportedAttributes: supportedAttrs('nve-button')
              }
            }
          ]
        },
        {
          code: '<nve-card nve-layout="column"></nve-card>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'nve-layout', element: 'nve-card', supportedAttributes: supportedAttrs('nve-card') }
            }
          ]
        },
        {
          code: '<nve-card nve-layout="row gap:md"></nve-card>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'nve-layout', element: 'nve-card', supportedAttributes: supportedAttrs('nve-card') }
            }
          ]
        }
      ]
    });
  });

  it('should report nve-text on custom elements', () => {
    tester.run('nve-text on custom elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-button nve-text="body"></nve-button>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'nve-text', element: 'nve-button', supportedAttributes: supportedAttrs('nve-button') }
            }
          ]
        },
        {
          code: '<nve-card nve-text="heading"></nve-card>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'nve-text', element: 'nve-card', supportedAttributes: supportedAttrs('nve-card') }
            }
          ]
        }
      ]
    });
  });

  it('should report mlv-layout on custom elements', () => {
    tester.run('mlv-layout on custom elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-card mlv-layout="row"></nve-card>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'mlv-layout', element: 'nve-card', supportedAttributes: supportedAttrs('nve-card') }
            }
          ]
        },
        {
          code: '<custom-element mlv-layout="column"></custom-element>',
          errors: [
            { messageId: 'no-restricted-attributes', data: { attribute: 'mlv-layout', element: 'custom-element' } }
          ]
        }
      ]
    });
  });

  it('should report mlv-text on custom elements', () => {
    tester.run('mlv-text on custom elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-badge mlv-text="body"></nve-badge>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'mlv-text', element: 'nve-badge', supportedAttributes: supportedAttrs('nve-badge') }
            }
          ]
        },
        {
          code: '<custom-element mlv-text="caption"></custom-element>',
          errors: [
            { messageId: 'no-restricted-attributes', data: { attribute: 'mlv-text', element: 'custom-element' } }
          ]
        }
      ]
    });
  });

  it('should allow external box-model nve-layout values on custom elements', () => {
    tester.run('allow external box-model layout values', rule, {
      valid: [
        '<nve-button nve-layout="span:6"></nve-button>',
        '<nve-card nve-layout="full"></nve-card>',
        '<nve-card nve-layout="full span:6"></nve-card>',
        '<nve-card nve-layout="span:3 span:6"></nve-card>',
        '<custom-element nve-layout="full"></custom-element>'
      ],
      invalid: []
    });
  });

  it('should report nve-layout with mixed external and internal values', () => {
    tester.run('mixed external and internal layout values', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-card nve-layout="full pad:md"></nve-card>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'nve-layout', element: 'nve-card', supportedAttributes: supportedAttrs('nve-card') }
            }
          ]
        },
        {
          code: '<nve-card nve-layout="row span:6"></nve-card>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'nve-layout', element: 'nve-card', supportedAttributes: supportedAttrs('nve-card') }
            }
          ]
        }
      ]
    });
  });

  it('should report variant attribute on nve-* elements', () => {
    tester.run('variant on nve elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-button variant="primary"></nve-button>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'variant', element: 'nve-button', supportedAttributes: supportedAttrs('nve-button') }
            }
          ]
        },
        {
          code: '<nve-badge variant="outlined"></nve-badge>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'variant', element: 'nve-badge', supportedAttributes: supportedAttrs('nve-badge') }
            }
          ]
        }
      ]
    });
  });

  it('should allow variant attribute on non-nve custom elements', () => {
    tester.run('variant on non-nve elements', rule, {
      valid: ['<custom-element variant="primary"></custom-element>', '<my-button variant="outlined"></my-button>'],
      invalid: []
    });
  });

  it('should report restricted global attributes on non-nve custom elements', () => {
    tester.run('restricted attributes on non-nve custom elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<custom-element nve-layout="row"></custom-element>',
          errors: [
            { messageId: 'no-restricted-attributes', data: { attribute: 'nve-layout', element: 'custom-element' } }
          ]
        },
        {
          code: '<my-component nve-text="body"></my-component>',
          errors: [{ messageId: 'no-restricted-attributes', data: { attribute: 'nve-text', element: 'my-component' } }]
        }
      ]
    });
  });

  it('should report multiple restricted attributes on the same element', () => {
    tester.run('multiple restricted attributes', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-card nve-layout="row" nve-text="body"></nve-card>',
          errors: [
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'nve-layout', element: 'nve-card', supportedAttributes: supportedAttrs('nve-card') }
            },
            {
              messageId: 'no-restricted-attributes-with-supported',
              data: { attribute: 'nve-text', element: 'nve-card', supportedAttributes: supportedAttrs('nve-card') }
            }
          ]
        }
      ]
    });
  });
});
