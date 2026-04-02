// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noMissingPopoverTrigger from './no-missing-popover-trigger.js';

const rule = noMissingPopoverTrigger as unknown as JSRuleDefinition;

describe('noMissingPopoverTrigger', () => {
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
    expect(noMissingPopoverTrigger.meta).toBeDefined();
    expect(noMissingPopoverTrigger.meta.type).toBe('problem');
    expect(noMissingPopoverTrigger.meta.docs).toBeDefined();
    expect(noMissingPopoverTrigger.meta.docs.description).toBe(
      'Require popover elements to have a corresponding trigger element.'
    );
    expect(noMissingPopoverTrigger.meta.docs.category).toBe('Best Practice');
    expect(noMissingPopoverTrigger.meta.docs.recommended).toBe(true);
    expect(noMissingPopoverTrigger.meta.docs.url).toContain('/docs/lint/');
    expect(noMissingPopoverTrigger.meta.schema).toBeDefined();
    expect(noMissingPopoverTrigger.meta.messages).toBeDefined();
    expect(noMissingPopoverTrigger.meta.messages['missing-popover-trigger']).toBe(
      'Popover element <{{tag}}> is missing a trigger element. Add a button with popovertarget="{{id}}" or commandfor="{{id}}". If programmatically controlling the popover with JavaScript, add a hidden attribute to the popover element.'
    );
    expect(noMissingPopoverTrigger.meta.messages['missing-popover-id']).toBe(
      'Popover element <{{tag}}> is missing an id attribute. Add an id to enable trigger association.'
    );
    expect(noMissingPopoverTrigger.meta.messages['empty-anchor-with-trigger']).toBe(
      'Popover element <{{tag}}> has an empty anchor attribute. Remove the anchor attribute as it will be automatically anchored to the trigger element.'
    );
  });

  it('should allow popover elements with popovertarget trigger', () => {
    tester.run('valid popovertarget triggers', rule, {
      valid: [
        `<button popovertarget="dropdown">Open</button>
         <nve-dropdown id="dropdown"></nve-dropdown>`,
        `<nve-button popovertarget="dropdown">Open</nve-button>
         <nve-dropdown id="dropdown"></nve-dropdown>`,
        `<button popovertarget="tooltip">Hover</button>
         <nve-tooltip id="tooltip">Tooltip content</nve-tooltip>`,
        `<button popovertarget="toggletip">Click</button>
         <nve-toggletip id="toggletip">Toggletip content</nve-toggletip>`
      ],
      invalid: []
    });
  });

  it('should allow popover elements with hidden attribute', () => {
    tester.run('valid hidden attribute', rule, {
      valid: [
        `<nve-dropdown id="dropdown" hidden></nve-dropdown>`,
        `<nve-tooltip id="tooltip" hidden>Tooltip content</nve-tooltip>`,
        `<nve-toggletip id="toggletip" hidden>Toggletip content</nve-toggletip>`
      ],
      invalid: []
    });
  });

  it('should allow popover elements with commandfor trigger', () => {
    tester.run('valid commandfor triggers', rule, {
      valid: [
        `<button commandfor="dropdown">Open</button>
         <nve-dropdown id="dropdown"></nve-dropdown>`,
        `<button commandfor="tooltip">Hover</button>
         <nve-tooltip id="tooltip">Tooltip content</nve-tooltip>`,
        `<button commandfor="toggletip">Click</button>
         <nve-toggletip id="toggletip">Toggletip content</nve-toggletip>`
      ],
      invalid: []
    });
  });

  it('should allow non-popover elements without triggers', () => {
    tester.run('non-popover elements', rule, {
      valid: ['<div></div>', '<nve-button>Click me</nve-button>', '<nve-card><p>Content</p></nve-card>'],
      invalid: []
    });
  });

  it('should report popover elements with template syntax content but no trigger', () => {
    // Template syntax in content does not affect trigger requirement
    tester.run('template syntax content requires trigger', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-dropdown id="dropdown">${}</nve-dropdown>',
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-dropdown', id: 'dropdown' } }]
        },
        {
          code: '<nve-dropdown id="dropdown">{{ }}</nve-dropdown>',
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-dropdown', id: 'dropdown' } }]
        },
        {
          code: '<nve-dropdown id="dropdown">{% %}</nve-dropdown>',
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-dropdown', id: 'dropdown' } }]
        },
        {
          code: '<nve-tooltip id="tooltip">${content}</nve-tooltip>',
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-tooltip', id: 'tooltip' } }]
        }
      ]
    });
  });

  it('should allow popovers with data binding in id attribute', () => {
    tester.run('data binding in popover id', rule, {
      valid: [
        // Template literal syntax
        '<nve-dropdown id="${idProp}">Content</nve-dropdown>',
        // Angular property binding
        '<nve-dropdown [id]="idProp">Content</nve-dropdown>',
        // JSX expression (entire value)
        '<nve-dropdown id="{idProp}">Content</nve-dropdown>',
        // Lit property binding
        '<nve-dropdown .id="${idProp}">Content</nve-dropdown>',
        // Vue/Handlebars syntax
        '<nve-tooltip id="{{tooltipId}}">Content</nve-tooltip>'
      ],
      invalid: []
    });
  });

  it('should allow popovers when triggers use data binding', () => {
    tester.run('data binding in trigger attributes', rule, {
      valid: [
        // Template literal in popovertarget - popover should pass because trigger could match
        `<nve-button popovertarget="\${targetId}">Open</nve-button>
         <nve-dropdown id="dropdown">Content</nve-dropdown>`,
        // Angular binding in popovertarget
        `<nve-button [popovertarget]="targetId">Open</nve-button>
         <nve-dropdown id="dropdown">Content</nve-dropdown>`,
        // Lit binding in popovertarget
        `<nve-button .popovertarget="\${targetId}">Open</nve-button>
         <nve-dropdown id="dropdown">Content</nve-dropdown>`,
        // Template literal in commandfor
        `<nve-button commandfor="\${targetId}">Open</nve-button>
         <nve-dropdown id="dropdown">Content</nve-dropdown>`,
        // Angular binding in commandfor
        `<nve-button [commandfor]="targetId">Open</nve-button>
         <nve-dropdown id="dropdown">Content</nve-dropdown>`,
        // Lit binding in commandfor
        `<nve-button .commandfor="\${targetId}">Open</nve-button>
         <nve-dropdown id="dropdown">Content</nve-dropdown>`,
        // JSX expression in popovertarget
        `<nve-button popovertarget="{targetId}">Open</nve-button>
         <nve-dropdown id="dropdown">Content</nve-dropdown>`,
        // Vue/Handlebars in popovertarget
        `<nve-button popovertarget="{{targetId}}">Open</nve-button>
         <nve-dropdown id="dropdown">Content</nve-dropdown>`
      ],
      invalid: []
    });
  });

  it('should report popover elements without an id', () => {
    tester.run('missing id attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-dropdown></nve-dropdown>',
          errors: [{ messageId: 'missing-popover-id', data: { tag: 'nve-dropdown' } }]
        },
        {
          code: '<nve-tooltip>Content</nve-tooltip>',
          errors: [{ messageId: 'missing-popover-id', data: { tag: 'nve-tooltip' } }]
        },
        {
          code: '<nve-toggletip>Content</nve-toggletip>',
          errors: [{ messageId: 'missing-popover-id', data: { tag: 'nve-toggletip' } }]
        }
      ]
    });
  });

  it('should report popover elements with id but no trigger', () => {
    tester.run('missing trigger element', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-dropdown id="dropdown"></nve-dropdown>',
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-dropdown', id: 'dropdown' } }]
        },
        {
          code: '<nve-tooltip id="tooltip">Content</nve-tooltip>',
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-tooltip', id: 'tooltip' } }]
        },
        {
          code: '<nve-toggletip id="toggletip">Content</nve-toggletip>',
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-toggletip', id: 'toggletip' } }]
        },
        {
          code: `<button popovertarget="other">Open</button>
                 <nve-dropdown id="dropdown"></nve-dropdown>`,
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-dropdown', id: 'dropdown' } }]
        }
      ]
    });
  });

  it('should handle multiple popovers with mixed validity', () => {
    tester.run('multiple popovers', rule, {
      valid: [
        `<button popovertarget="dropdown1">Open 1</button>
         <button popovertarget="dropdown2">Open 2</button>
         <nve-dropdown id="dropdown1"></nve-dropdown>
         <nve-dropdown id="dropdown2"></nve-dropdown>`
      ],
      invalid: [
        {
          code: `<button popovertarget="dropdown1">Open 1</button>
                 <nve-dropdown id="dropdown1"></nve-dropdown>
                 <nve-dropdown id="dropdown2"></nve-dropdown>`,
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-dropdown', id: 'dropdown2' } }]
        }
      ]
    });
  });

  it('should find triggers nested inside other elements', () => {
    tester.run('nested triggers', rule, {
      valid: [
        `<div>
           <nav>
             <button popovertarget="dropdown">Open</button>
           </nav>
         </div>
         <nve-dropdown id="dropdown"></nve-dropdown>`,
        `<header>
           <div class="actions">
             <nve-button popovertarget="menu">Menu</nve-button>
           </div>
         </header>
         <nve-dropdown id="menu"></nve-dropdown>`
      ],
      invalid: []
    });
  });

  it('should allow anchor attribute with a value when trigger exists', () => {
    tester.run('valid anchor with trigger', rule, {
      valid: [
        `<button id="trigger" popovertarget="dropdown">Open</button>
         <nve-dropdown id="dropdown" anchor="trigger"></nve-dropdown>`,
        `<button id="btn" popovertarget="tooltip">Hover</button>
         <nve-tooltip id="tooltip" anchor="btn">Tooltip content</nve-tooltip>`,
        `<button commandfor="toggletip">Click</button>
         <nve-toggletip id="toggletip" anchor="other-element">Content</nve-toggletip>`
      ],
      invalid: []
    });
  });

  it('should report empty anchor attribute when trigger exists', () => {
    tester.run('empty anchor with trigger', rule, {
      valid: [],
      invalid: [
        {
          code: `<button id="trigger" popovertarget="dropdown">Open</button>
                 <nve-dropdown id="dropdown" anchor></nve-dropdown>`,
          errors: [{ messageId: 'empty-anchor-with-trigger', data: { tag: 'nve-dropdown' } }]
        },
        {
          code: `<button id="btn" popovertarget="tooltip">Hover</button>
                 <nve-tooltip id="tooltip" anchor="">Tooltip content</nve-tooltip>`,
          errors: [{ messageId: 'empty-anchor-with-trigger', data: { tag: 'nve-tooltip' } }]
        },
        {
          code: `<button id="toggle-btn" commandfor="toggletip">Click</button>
                 <nve-toggletip id="toggletip" anchor>Content</nve-toggletip>`,
          errors: [{ messageId: 'empty-anchor-with-trigger', data: { tag: 'nve-toggletip' } }]
        }
      ]
    });
  });

  it('should allow empty anchor attribute when no trigger exists', () => {
    tester.run('empty anchor without trigger', rule, {
      valid: [],
      invalid: [
        {
          // Only reports missing trigger, not empty anchor (since no trigger exists)
          code: '<nve-dropdown id="dropdown" anchor></nve-dropdown>',
          errors: [{ messageId: 'missing-popover-trigger', data: { tag: 'nve-dropdown', id: 'dropdown' } }]
        }
      ]
    });
  });

  it('should report empty anchor when trigger has no id', () => {
    tester.run('trigger without id', rule, {
      valid: [],
      invalid: [
        {
          code: `<button popovertarget="dropdown">Open</button>
                 <nve-dropdown id="dropdown" anchor></nve-dropdown>`,
          errors: [{ messageId: 'empty-anchor-with-trigger', data: { tag: 'nve-dropdown' } }]
        }
      ]
    });
  });
});
