// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import html from '@html-eslint/eslint-plugin';
import noUnstyledTypography from './no-unstyled-typography.js';

const rule = noUnstyledTypography as unknown as JSRuleDefinition;

describe('noUnstyledTypography', () => {
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
    expect(noUnstyledTypography.meta).toBeDefined();
    expect(noUnstyledTypography.meta.type).toBe('problem');
    expect(noUnstyledTypography.meta.hasSuggestions).toBe(true);
    expect(noUnstyledTypography.meta.docs).toBeDefined();
    expect(noUnstyledTypography.meta.docs.description).toBe(
      'Require typography elements to have nve-text styling applied.'
    );
    expect(noUnstyledTypography.meta.docs.category).toBe('Best Practice');
    expect(noUnstyledTypography.meta.docs.recommended).toBe(true);
    expect(noUnstyledTypography.meta.docs.url).toContain('/docs/lint/');
    expect(noUnstyledTypography.meta.schema).toEqual([]);
    expect(noUnstyledTypography.meta.messages).toBeDefined();
    expect(noUnstyledTypography.meta.messages['unstyled-typography']).toBe(
      '<{{element}}> is missing text styling. Add nve-text="{{nveTextValue}}" or a class attribute.'
    );
    expect(noUnstyledTypography.meta.messages['suggest-add-nve-text']).toBe(
      'Add nve-text="{{nveTextValue}}" to the element'
    );
  });

  it('should allow elements with nve-text attribute', () => {
    tester.run('should allow elements with nve-text attribute', rule, {
      valid: [
        '<h1 nve-text="heading lg">Title</h1>',
        '<h2 nve-text="heading">Subtitle</h2>',
        '<h3 nve-text="heading sm">Section</h3>',
        '<p nve-text="body">Content</p>',
        '<ul nve-text="list"><li>item</li></ul>',
        '<ol nve-text="list"><li>item</li></ol>',
        '<code nve-text="code">const x = 1</code>'
      ],
      invalid: []
    });
  });

  it('should allow elements with class attribute', () => {
    tester.run('should allow elements with class attribute', rule, {
      valid: [
        '<h1 class="title">Title</h1>',
        '<p class="description">Content</p>',
        '<ul class="my-list"><li>item</li></ul>',
        '<ol class="steps"><li>step</li></ol>',
        '<code class="snippet">code</code>'
      ],
      invalid: []
    });
  });

  it('should allow elements with style attribute', () => {
    tester.run('should allow elements with style attribute', rule, {
      valid: [
        '<h1 style="font-size: 2rem">Title</h1>',
        '<p style="color: gray">Content</p>',
        '<ul style="list-style: disc"><li>item</li></ul>'
      ],
      invalid: []
    });
  });

  it('should allow non-typography elements without styling', () => {
    tester.run('should allow non-typography elements', rule, {
      valid: [
        '<div></div>',
        '<section></section>',
        '<span>text</span>',
        '<nav></nav>',
        '<nve-button>click</nve-button>'
      ],
      invalid: []
    });
  });

  it('should report unstyled heading elements', () => {
    tester.run('should report unstyled headings', rule, {
      valid: [],
      invalid: [
        {
          code: '<h1>Title</h1>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'h1', nveTextValue: 'heading' },
              suggestions: [{ messageId: 'suggest-add-nve-text', output: '<h1 nve-text="heading">Title</h1>' }]
            }
          ]
        },
        {
          code: '<h2>Subtitle</h2>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'h2', nveTextValue: 'heading' },
              suggestions: [{ messageId: 'suggest-add-nve-text', output: '<h2 nve-text="heading">Subtitle</h2>' }]
            }
          ]
        },
        {
          code: '<h3>Section</h3>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'h3', nveTextValue: 'heading' },
              suggestions: [{ messageId: 'suggest-add-nve-text', output: '<h3 nve-text="heading">Section</h3>' }]
            }
          ]
        },
        {
          code: '<h4>Sub-section</h4>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'h4', nveTextValue: 'heading' },
              suggestions: [{ messageId: 'suggest-add-nve-text', output: '<h4 nve-text="heading">Sub-section</h4>' }]
            }
          ]
        },
        {
          code: '<h5>Minor heading</h5>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'h5', nveTextValue: 'heading' },
              suggestions: [{ messageId: 'suggest-add-nve-text', output: '<h5 nve-text="heading">Minor heading</h5>' }]
            }
          ]
        },
        {
          code: '<h6>Smallest heading</h6>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'h6', nveTextValue: 'heading' },
              suggestions: [
                { messageId: 'suggest-add-nve-text', output: '<h6 nve-text="heading">Smallest heading</h6>' }
              ]
            }
          ]
        }
      ]
    });
  });

  it('should report unstyled paragraph elements', () => {
    tester.run('should report unstyled paragraphs', rule, {
      valid: [],
      invalid: [
        {
          code: '<p>Some text content</p>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'p', nveTextValue: 'body' },
              suggestions: [{ messageId: 'suggest-add-nve-text', output: '<p nve-text="body">Some text content</p>' }]
            }
          ]
        }
      ]
    });
  });

  it('should report unstyled list elements', () => {
    tester.run('should report unstyled lists', rule, {
      valid: [],
      invalid: [
        {
          code: '<ul><li>item</li></ul>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'ul', nveTextValue: 'list' },
              suggestions: [{ messageId: 'suggest-add-nve-text', output: '<ul nve-text="list"><li>item</li></ul>' }]
            }
          ]
        },
        {
          code: '<ol><li>item</li></ol>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'ol', nveTextValue: 'list' },
              suggestions: [{ messageId: 'suggest-add-nve-text', output: '<ol nve-text="list"><li>item</li></ol>' }]
            }
          ]
        }
      ]
    });
  });

  it('should report unstyled code elements', () => {
    tester.run('should report unstyled code', rule, {
      valid: [],
      invalid: [
        {
          code: '<code>const x = 1</code>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'code', nveTextValue: 'code' },
              suggestions: [{ messageId: 'suggest-add-nve-text', output: '<code nve-text="code">const x = 1</code>' }]
            }
          ]
        }
      ]
    });
  });

  it('should report unstyled element with non-styling attributes', () => {
    tester.run('should report with non-styling attributes', rule, {
      valid: [],
      invalid: [
        {
          code: '<h2 id="section-title">Title</h2>',
          errors: [
            {
              messageId: 'unstyled-typography',
              data: { element: 'h2', nveTextValue: 'heading' },
              suggestions: [
                { messageId: 'suggest-add-nve-text', output: '<h2 nve-text="heading" id="section-title">Title</h2>' }
              ]
            }
          ]
        }
      ]
    });
  });
});
