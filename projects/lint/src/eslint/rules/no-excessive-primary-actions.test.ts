// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noExcessivePrimaryActions from './no-excessive-primary-actions.js';

const rule = noExcessivePrimaryActions as unknown as JSRuleDefinition;
const error = {
  messageId: 'excessive-primary-action' as const,
  data: { max: '2' }
};

describe('noExcessivePrimaryActions', () => {
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
    expect(noExcessivePrimaryActions.meta).toBeDefined();
    expect(noExcessivePrimaryActions.meta.type).toBe('problem');
    expect(noExcessivePrimaryActions.meta.docs).toBeDefined();
    expect(noExcessivePrimaryActions.meta.docs.description).toBe('Limit primary actions to two per page.');
    expect(noExcessivePrimaryActions.meta.docs.category).toBe('Best Practice');
    expect(noExcessivePrimaryActions.meta.docs.recommended).toBe(true);
    expect(noExcessivePrimaryActions.meta.docs.url).toContain('/docs/lint/');
    expect(noExcessivePrimaryActions.meta.schema).toEqual([]);
    expect(noExcessivePrimaryActions.meta.messages['excessive-primary-action']).toBe(
      'Limit primary actions to {{max}} per page. Reserve interaction="emphasis" for primary calls to action.'
    );
  });

  it('should allow no more than two emphasis buttons', () => {
    tester.run('valid emphasis button count', rule, {
      valid: [
        '<nve-button>Default</nve-button>',
        '<nve-button interaction="emphasis">Primary action</nve-button>',
        `<nve-button interaction="emphasis">Primary action</nve-button>
         <nve-button interaction="emphasis">Secondary action</nve-button>`,
        `<nve-button interaction="emphasis">Primary action</nve-button>
         <nve-button interaction="destructive">Delete</nve-button>
         <nve-button interaction="neutral">Cancel</nve-button>`
      ],
      invalid: []
    });
  });

  it('should ignore emphasis on elements other than nve-button', () => {
    tester.run('non-button elements', rule, {
      valid: [
        `<nve-icon-button interaction="emphasis" icon-name="menu"></nve-icon-button>
         <custom-button interaction="emphasis">Custom action</custom-button>
         <button interaction="emphasis">Native action</button>`
      ],
      invalid: []
    });
  });

  it('should ignore dynamic interaction values', () => {
    tester.run('dynamic interaction values', rule, {
      valid: [
        `<nve-button interaction="\${interaction}">Lit attribute</nve-button>
         <nve-button .interaction="\${interaction}">Lit property</nve-button>
         <nve-button [interaction]="interaction">Angular property</nve-button>
         <nve-button interaction="{{ interaction }}">Template binding</nve-button>
         <nve-button interaction="{interaction}">JSX expression</nve-button>`
      ],
      invalid: []
    });
  });

  it('should count separate tagged templates independently', () => {
    const javascriptTester = new RuleTester({
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    });

    javascriptTester.run('separate tagged templates', rule, {
      valid: [
        `const first = html\`
           <nve-button interaction="emphasis">One</nve-button>
           <nve-button interaction="emphasis">Two</nve-button>
         \`;
         const second = html\`
           <nve-button interaction="emphasis">Three</nve-button>
           <nve-button interaction="emphasis">Four</nve-button>
         \`;`
      ],
      invalid: [
        {
          code: `const template = html\`
            <nve-button interaction="emphasis">One</nve-button>
            <nve-button interaction="emphasis">Two</nve-button>
            <nve-button interaction="emphasis">Three</nve-button>
          \`;`,
          errors: [error]
        }
      ]
    });
  });

  it('should report the third emphasis button', () => {
    tester.run('third emphasis button', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-button interaction="emphasis">One</nve-button>
                 <nve-button interaction="emphasis">Two</nve-button>
                 <nve-button interaction="emphasis">Three</nve-button>`,
          errors: [error]
        }
      ]
    });
  });

  it('should report every emphasis button after the second', () => {
    tester.run('multiple excessive emphasis buttons', rule, {
      valid: [],
      invalid: [
        {
          code: `<main>
                   <nve-button interaction="emphasis">One</nve-button>
                   <section>
                     <nve-button interaction="emphasis">Two</nve-button>
                     <nve-button interaction="emphasis">Three</nve-button>
                   </section>
                   <nve-button interaction="emphasis">Four</nve-button>
                 </main>`,
          errors: [error, error]
        }
      ]
    });
  });
});
