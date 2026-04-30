// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noTailwindClasses from './no-tailwind-classes.js';

const rule = noTailwindClasses as unknown as JSRuleDefinition;

describe('noTailwindClasses', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      languageOptions: {
        parser: htmlParser,
        parserOptions: {
          frontmatter: true
        }
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noTailwindClasses.meta).toBeDefined();
    expect(noTailwindClasses.meta.type).toBe('problem');
    expect(noTailwindClasses.meta.docs).toBeDefined();
    expect(noTailwindClasses.meta.docs.description).toBe(
      'Reports Tailwind classes that conflict with Elements styling. Strict mode reports any Tailwind-shaped class.'
    );
    expect(noTailwindClasses.meta.docs.category).toBe('Best Practice');
    expect(noTailwindClasses.meta.docs.recommended).toBe(true);
    expect(noTailwindClasses.meta.docs.url).toContain('/docs/lint/');
    expect(noTailwindClasses.meta.schema).toBeDefined();
    expect(noTailwindClasses.meta.messages).toBeDefined();
    expect(noTailwindClasses.meta.messages['no-tailwind-class']).toBe(
      'Unexpected Tailwind class "{{tailwindClass}}" on <{{tagName}}>. Use Elements global attributes (nve-layout, nve-text, nve-display) or Elements components instead.'
    );
    expect(noTailwindClasses.meta.messages['no-tailwind-class-with-suggestion']).toBe(
      'Unexpected Tailwind class "{{tailwindClass}}" on <{{tagName}}>. Use {{suggestion}} instead.'
    );
    expect(noTailwindClasses.meta.messages['no-tailwind-class-on-nve-element']).toBe(
      'Unexpected Tailwind class "{{tailwindClass}}" on <{{tagName}}>. nve-* components do not support Tailwind utilities — use component-specific APIs instead.'
    );
  });

  it('should allow elements without a class attribute', () => {
    tester.run('should allow elements without a class attribute', rule, {
      valid: [
        '<div></div>',
        '<nve-button>Button</nve-button>',
        '<nve-icon name="check"></nve-icon>',
        '<div id="foo" data-test="bar"></div>'
      ],
      invalid: []
    });
  });

  it('should allow empty or whitespace-only class values', () => {
    tester.run('should allow empty or whitespace-only class values', rule, {
      valid: ['<div class=""></div>', '<div class="   "></div>', '<div class></div>'],
      invalid: []
    });
  });

  it('should allow custom non-Tailwind class names', () => {
    tester.run('should allow custom non-Tailwind class names', rule, {
      valid: [
        '<div class="my-card"></div>',
        '<div class="card title__primary"></div>',
        '<div class="container"></div>',
        '<nve-card class="theme-dark"></nve-card>',
        '<section class="hero hero--large hero__title"></section>'
      ],
      invalid: []
    });
  });

  it('should allow class values with template bindings', () => {
    tester.run('should allow class values with template bindings', rule, {
      valid: [
        '<div class="${cls}"></div>',
        '<div class="{{cls}}"></div>',
        '<div class="{cls}"></div>',
        '<div class="{% if active %}active{% endif %}"></div>',
        '<div class="card ${dynamic}"></div>'
      ],
      invalid: []
    });
  });

  it('should report static Tailwind tokens on nve-* elements in class values with template bindings', () => {
    tester.run('should report static Tailwind tokens on nve-* elements in class values with template bindings', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-card class="p-4 ${dynamic}"></nve-card>',
          errors: [
            {
              messageId: 'no-tailwind-class-on-nve-element',
              data: { tailwindClass: 'p-4', tagName: 'nve-card' }
            }
          ]
        }
      ]
    });
  });

  it('should allow markdown-frontmatter wrapped content', () => {
    tester.run('should allow markdown-frontmatter wrapped content', rule, {
      valid: ['---\ntitle: Test\n---\n<div class="my-card"></div>'],
      invalid: []
    });
  });

  it('should allow standalone Tailwind keywords on non-nve elements by default', () => {
    tester.run('should allow standalone Tailwind keywords on non-nve elements by default', rule, {
      valid: ['<div class="truncate"></div>', '<div class="flex"></div>', '<div class="hidden"></div>'],
      invalid: []
    });
  });

  it('should allow Tailwind tokens matching the prefix regex on non-nve elements by default', () => {
    tester.run('should allow Tailwind tokens matching the prefix regex on non-nve elements by default', rule, {
      valid: ['<div class="p-4"></div>', '<div class="bg-red-500"></div>', '<div class="text-xl"></div>'],
      invalid: []
    });
  });

  it('should ignore tokens with arbitrary bracket values when no hint exists', () => {
    tester.run('should ignore tokens with arbitrary bracket values when no hint exists', rule, {
      valid: ['<div class="bg-[#ff0000]"></div>', '<div class="w-[123px]"></div>'],
      invalid: []
    });
  });

  it('should allow tokens with variant prefixes on non-nve elements by default', () => {
    tester.run('should allow tokens with variant prefixes on non-nve elements by default', rule, {
      valid: [
        '<div class="hover:bg-red-500"></div>',
        '<div class="dark:hover:bg-red-500"></div>',
        '<div class="md:flex"></div>'
      ],
      invalid: []
    });
  });

  it('should ignore tokens with the important modifier when no hint exists', () => {
    tester.run('should ignore tokens with the important modifier when no hint exists', rule, {
      valid: ['<div class="!p-4"></div>'],
      invalid: []
    });
  });

  it('should ignore negative spacing tokens when no hint exists', () => {
    tester.run('should ignore negative spacing tokens when no hint exists', rule, {
      valid: ['<div class="-mx-4"></div>'],
      invalid: []
    });
  });

  it('should allow Tailwind tokens mixed with custom classes on non-nve elements by default', () => {
    tester.run('should allow Tailwind tokens mixed with custom classes on non-nve elements by default', rule, {
      valid: ['<div class="my-card flex p-4"></div>'],
      invalid: []
    });
  });

  it('should allow class values containing newlines on non-nve elements by default', () => {
    tester.run('should allow class values containing newlines on non-nve elements by default', rule, {
      valid: ['<div class="flex\n  p-4"></div>'],
      invalid: []
    });
  });

  it('should ignore non-class attributes that contain Tailwind-like values', () => {
    tester.run('should ignore non-class attributes that contain Tailwind-like values', rule, {
      valid: ['<div id="flex"></div>', '<div data-test="p-4"></div>', '<div title="Use flex layout"></div>'],
      invalid: []
    });
  });

  describe('with { strict: true }', () => {
    const strictOptions = [{ strict: true }];

    it('should report any Tailwind class even without a known alternative', () => {
      tester.run('should report any Tailwind class even without a known alternative', rule, {
        valid: [],
        invalid: [
          {
            code: '<div class="truncate"></div>',
            options: strictOptions,
            errors: [{ messageId: 'no-tailwind-class', data: { tailwindClass: 'truncate', tagName: 'div' } }]
          },
          {
            code: '<div class="p-4"></div>',
            options: strictOptions,
            errors: [{ messageId: 'no-tailwind-class', data: { tailwindClass: 'p-4', tagName: 'div' } }]
          },
          {
            code: '<div class="bg-red-500"></div>',
            options: strictOptions,
            errors: [{ messageId: 'no-tailwind-class', data: { tailwindClass: 'bg-red-500', tagName: 'div' } }]
          }
        ]
      });
    });

    it('should still prefer the suggestion message when a hint exists', () => {
      tester.run('should still prefer the suggestion message when a hint exists', rule, {
        valid: [],
        invalid: [
          {
            code: '<div class="flex"></div>',
            options: strictOptions,
            errors: [
              {
                messageId: 'no-tailwind-class-with-suggestion',
                data: { tailwindClass: 'flex', tagName: 'div', suggestion: 'nve-layout="row"' }
              }
            ]
          },
          {
            code: '<div class="hidden"></div>',
            options: strictOptions,
            errors: [
              {
                messageId: 'no-tailwind-class-with-suggestion',
                data: { tailwindClass: 'hidden', tagName: 'div', suggestion: 'nve-display="hide"' }
              }
            ]
          },
          {
            code: '<div class="text-xl"></div>',
            options: strictOptions,
            errors: [
              {
                messageId: 'no-tailwind-class-with-suggestion',
                data: { tailwindClass: 'text-xl', tagName: 'div', suggestion: 'nve-text="xl"' }
              }
            ]
          },
          {
            code: '<div class="md:flex"></div>',
            options: strictOptions,
            errors: [
              {
                messageId: 'no-tailwind-class-with-suggestion',
                data: { tailwindClass: 'md:flex', tagName: 'div', suggestion: 'nve-layout="row"' }
              }
            ]
          },
          {
            code: '<div class="flex ${dynamic}"></div>',
            options: strictOptions,
            errors: [
              {
                messageId: 'no-tailwind-class-with-suggestion',
                data: { tailwindClass: 'flex', tagName: 'div', suggestion: 'nve-layout="row"' }
              }
            ]
          }
        ]
      });
    });

    it('should report bracket, important, negative, and variant tokens', () => {
      tester.run('should report bracket, important, negative, and variant tokens', rule, {
        valid: [],
        invalid: [
          {
            code: '<div class="bg-[#ff0000]"></div>',
            options: strictOptions,
            errors: [{ messageId: 'no-tailwind-class', data: { tailwindClass: 'bg-[#ff0000]', tagName: 'div' } }]
          },
          {
            code: '<div class="w-[123px]"></div>',
            options: strictOptions,
            errors: [{ messageId: 'no-tailwind-class', data: { tailwindClass: 'w-[123px]', tagName: 'div' } }]
          },
          {
            code: '<div class="!p-4"></div>',
            options: strictOptions,
            errors: [{ messageId: 'no-tailwind-class', data: { tailwindClass: '!p-4', tagName: 'div' } }]
          },
          {
            code: '<div class="-mx-4"></div>',
            options: strictOptions,
            errors: [{ messageId: 'no-tailwind-class', data: { tailwindClass: '-mx-4', tagName: 'div' } }]
          },
          {
            code: '<div class="hover:bg-red-500"></div>',
            options: strictOptions,
            errors: [{ messageId: 'no-tailwind-class', data: { tailwindClass: 'hover:bg-red-500', tagName: 'div' } }]
          },
          {
            code: '<div class="dark:hover:bg-red-500"></div>',
            options: strictOptions,
            errors: [
              {
                messageId: 'no-tailwind-class',
                data: { tailwindClass: 'dark:hover:bg-red-500', tagName: 'div' }
              }
            ]
          }
        ]
      });
    });

    it('should report mixed hinted and unhinted Tailwind tokens together', () => {
      tester.run('should report mixed hinted and unhinted Tailwind tokens together', rule, {
        valid: [],
        invalid: [
          {
            code: '<div class="my-card flex p-4"></div>',
            options: strictOptions,
            errors: [
              {
                messageId: 'no-tailwind-class-with-suggestion',
                data: { tailwindClass: 'flex', tagName: 'div', suggestion: 'nve-layout="row"' }
              },
              { messageId: 'no-tailwind-class', data: { tailwindClass: 'p-4', tagName: 'div' } }
            ]
          }
        ]
      });
    });
  });

  describe('tailwind classes on nve-* elements', () => {
    it('should report Tailwind classes that style nve-* element surfaces or internals', () => {
      tester.run('should report Tailwind classes that style nve-* element surfaces or internals', rule, {
        valid: [],
        invalid: [
          {
            code: '<nve-card class="p-4"></nve-card>',
            errors: [
              { messageId: 'no-tailwind-class-on-nve-element', data: { tailwindClass: 'p-4', tagName: 'nve-card' } }
            ]
          },
          {
            code: '<nve-card class="bg-red-500"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'bg-red-500', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="rounded-lg"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'rounded-lg', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-button class="text-xl"></nve-button>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'text-xl', tagName: 'nve-button' }
              }
            ]
          },
          {
            code: '<nve-button class="text-base"></nve-button>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'text-base', tagName: 'nve-button' }
              }
            ]
          },
          {
            code: '<nve-card class="border"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'border', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="shadow-md"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'shadow-md', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="px-4"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'px-4', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="flex"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'flex', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="items-center"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'items-center', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="justify-center"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'justify-center', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="grid-cols-3"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'grid-cols-3', tagName: 'nve-card' }
              }
            ]
          }
        ]
      });
    });

    it('should allow host-level Tailwind utilities on nve-* elements', () => {
      tester.run('should allow host-level Tailwind utilities on nve-* elements', rule, {
        valid: [
          '<nve-card class="hidden"></nve-card>',
          '<nve-card class="visible"></nve-card>',
          '<nve-card class="invisible"></nve-card>',
          '<nve-card class="sr-only"></nve-card>',
          '<nve-card class="not-sr-only"></nve-card>',
          '<nve-card class="absolute"></nve-card>',
          '<nve-card class="sticky"></nve-card>',
          '<nve-card class="top-4"></nve-card>',
          '<nve-card class="z-10"></nve-card>',
          '<nve-card class="mt-4"></nve-card>',
          '<nve-card class="-mx-4"></nve-card>',
          '<nve-card class="m-[10px]"></nve-card>',
          '<nve-card class="self-center"></nve-card>',
          '<nve-card class="basis-1/2"></nve-card>',
          '<nve-card class="order-1"></nve-card>',
          '<nve-card class="grow"></nve-card>',
          '<nve-card class="shrink"></nve-card>'
        ],
        invalid: []
      });
    });

    it('should handle variants, modifiers, and brackets on nve-* elements', () => {
      tester.run('should handle variants, modifiers, and brackets on nve-* elements', rule, {
        valid: [],
        invalid: [
          {
            code: '<nve-card class="!p-4"></nve-card>',
            errors: [
              { messageId: 'no-tailwind-class-on-nve-element', data: { tailwindClass: '!p-4', tagName: 'nve-card' } }
            ]
          },
          {
            code: '<nve-card class="hover:bg-red-500"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'hover:bg-red-500', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="md:flex"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'md:flex', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="w-[123px]"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'w-[123px]', tagName: 'nve-card' }
              }
            ]
          }
        ]
      });
    });

    it('should allow host-level Tailwind utilities with variants, modifiers, and brackets on nve-* elements', () => {
      tester.run(
        'should allow host-level Tailwind utilities with variants, modifiers, and brackets on nve-* elements',
        rule,
        {
          valid: [
            '<nve-card class="md:absolute"></nve-card>',
            '<nve-card class="!-mt-4"></nve-card>',
            '<nve-card class="md:self-center"></nve-card>',
            '<nve-card class="hover:m-[10px]"></nve-card>'
          ],
          invalid: []
        }
      );
    });

    it('should not flag non-Tailwind custom classes on nve-* elements', () => {
      tester.run('should not flag non-Tailwind custom classes on nve-* elements', rule, {
        valid: [
          '<nve-card class="theme-dark"></nve-card>',
          '<nve-card class="my-card"></nve-card>',
          '<nve-card class="p-section"></nve-card>',
          '<nve-card class="flex-container"></nve-card>',
          '<nve-card class="card hero__title"></nve-card>'
        ],
        invalid: []
      });
    });

    it('should report only invalid Tailwind tokens in a mixed class list on nve-* elements', () => {
      tester.run('should report only invalid Tailwind tokens in a mixed class list on nve-* elements', rule, {
        valid: [],
        invalid: [
          {
            code: '<nve-card class="my-card sticky flex mt-4 p-4 bg-red-500 self-center"></nve-card>',
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'flex', tagName: 'nve-card' }
              },
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'p-4', tagName: 'nve-card' }
              },
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'bg-red-500', tagName: 'nve-card' }
              }
            ]
          }
        ]
      });
    });

    it('should only allow host-level Tailwind utilities on nve-* elements outside strict mode', () => {
      tester.run('should only allow host-level Tailwind utilities on nve-* elements outside strict mode', rule, {
        valid: [
          {
            code: '<nve-card class="hidden"></nve-card>',
            options: [{ strict: false }]
          },
          {
            code: '<nve-card class="m-4"></nve-card>',
            options: [{ strict: false }]
          }
        ],
        invalid: [
          {
            code: '<nve-card class="p-4"></nve-card>',
            options: [{ strict: false }],
            errors: [
              { messageId: 'no-tailwind-class-on-nve-element', data: { tailwindClass: 'p-4', tagName: 'nve-card' } }
            ]
          },
          {
            code: '<nve-card class="p-4"></nve-card>',
            options: [{ strict: true }],
            errors: [
              { messageId: 'no-tailwind-class-on-nve-element', data: { tailwindClass: 'p-4', tagName: 'nve-card' } }
            ]
          },
          {
            code: '<nve-card class="hidden"></nve-card>',
            options: [{ strict: true }],
            errors: [
              {
                messageId: 'no-tailwind-class-on-nve-element',
                data: { tailwindClass: 'hidden', tagName: 'nve-card' }
              }
            ]
          },
          {
            code: '<nve-card class="m-4"></nve-card>',
            options: [{ strict: true }],
            errors: [
              { messageId: 'no-tailwind-class-on-nve-element', data: { tailwindClass: 'm-4', tagName: 'nve-card' } }
            ]
          }
        ]
      });
    });
  });
});
