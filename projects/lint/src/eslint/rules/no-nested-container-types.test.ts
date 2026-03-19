// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noNestedContainerTypes from './no-nested-container-types.js';

const rule = noNestedContainerTypes as unknown as JSRuleDefinition;

function nestedError(child: string, parent: string, output: string) {
  return {
    messageId: 'no-nested-container-types' as const,
    data: { child, parent },
    suggestions: [{ messageId: 'suggest-add-container-flat', data: { child }, output }]
  };
}

describe('noNestedContainerTypes', () => {
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
    expect(noNestedContainerTypes.meta).toBeDefined();
    expect(noNestedContainerTypes.meta.type).toBe('problem');
    expect(noNestedContainerTypes.meta.docs).toBeDefined();
    expect(noNestedContainerTypes.meta.docs.description).toBe(
      'Disallow nesting container components without container="flat".'
    );
    expect(noNestedContainerTypes.meta.docs.category).toBe('Best Practice');
    expect(noNestedContainerTypes.meta.docs.recommended).toBe(true);
    expect(noNestedContainerTypes.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noNestedContainerTypes.meta.schema).toBeDefined();
    expect(noNestedContainerTypes.meta.messages).toBeDefined();
    expect(noNestedContainerTypes.meta.messages['no-nested-container-types']).toBe(
      '<{{child}}> nested inside <{{parent}}> should use container="flat" to avoid visual nesting issues.'
    );
    expect(noNestedContainerTypes.meta.messages['suggest-add-container-flat']).toBe(
      'Add container="flat" to <{{child}}>'
    );
  });

  it('should allow valid container nesting', () => {
    tester.run('valid container nesting', rule, {
      valid: [
        // Child with container="flat" inside parent
        `<nve-card-content><nve-grid container="flat"></nve-grid></nve-card-content>`,
        `<nve-grid-cell><nve-badge container="flat"></nve-badge></nve-grid-cell>`,
        `<nve-page-panel><nve-grid container="flat"></nve-grid></nve-page-panel>`,
        `<nve-dialog><nve-grid container="flat"></nve-grid></nve-dialog>`,
        `<nve-drawer><nve-grid container="flat"></nve-grid></nve-drawer>`,
        `<nve-card><nve-grid container="flat"></nve-grid></nve-card>`,
        `<nve-card><nve-accordion container="flat"></nve-accordion></nve-card>`,
        `<nve-card><nve-accordion-group container="flat"></nve-accordion-group></nve-card>`,
        // Child outside container parent
        `<div><nve-grid></nve-grid></div>`,
        `<nve-grid></nve-grid>`,
        `<nve-badge></nve-badge>`,
        // Unrelated elements
        `<nve-card-content><nve-button></nve-button></nve-card-content>`,
        // Template syntax bindings on container attribute
        `<nve-card-content><nve-grid container="\${expr}"></nve-grid></nve-card-content>`,
        `<nve-card-content><nve-grid container="{{expr}}"></nve-grid></nve-card-content>`,
        `<nve-card-content><nve-grid container="{% expr %}"></nve-grid></nve-card-content>`
      ],
      invalid: []
    });
  });

  it('should report nested containers without container="flat"', () => {
    tester.run('nested containers without flat', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-card-content><nve-grid></nve-grid></nve-card-content>`,
          errors: [
            nestedError(
              'nve-grid',
              'nve-card-content',
              `<nve-card-content><nve-grid container="flat"></nve-grid></nve-card-content>`
            )
          ]
        },
        {
          code: `<nve-card-content><nve-accordion></nve-accordion></nve-card-content>`,
          errors: [
            nestedError(
              'nve-accordion',
              'nve-card-content',
              `<nve-card-content><nve-accordion container="flat"></nve-accordion></nve-card-content>`
            )
          ]
        },
        {
          code: `<nve-card-content><nve-accordion-group></nve-accordion-group></nve-card-content>`,
          errors: [
            nestedError(
              'nve-accordion-group',
              'nve-card-content',
              `<nve-card-content><nve-accordion-group container="flat"></nve-accordion-group></nve-card-content>`
            )
          ]
        },
        {
          code: `<nve-grid-cell><nve-badge></nve-badge></nve-grid-cell>`,
          errors: [
            nestedError(
              'nve-badge',
              'nve-grid-cell',
              `<nve-grid-cell><nve-badge container="flat"></nve-badge></nve-grid-cell>`
            )
          ]
        },
        {
          code: `<nve-page-panel><nve-grid></nve-grid></nve-page-panel>`,
          errors: [
            nestedError(
              'nve-grid',
              'nve-page-panel',
              `<nve-page-panel><nve-grid container="flat"></nve-grid></nve-page-panel>`
            )
          ]
        },
        {
          code: `<nve-dialog><nve-grid></nve-grid></nve-dialog>`,
          errors: [
            nestedError('nve-grid', 'nve-dialog', `<nve-dialog><nve-grid container="flat"></nve-grid></nve-dialog>`)
          ]
        },
        {
          code: `<nve-drawer><nve-grid></nve-grid></nve-drawer>`,
          errors: [
            nestedError('nve-grid', 'nve-drawer', `<nve-drawer><nve-grid container="flat"></nve-grid></nve-drawer>`)
          ]
        },
        {
          code: `<nve-card><nve-grid></nve-grid></nve-card>`,
          errors: [nestedError('nve-grid', 'nve-card', `<nve-card><nve-grid container="flat"></nve-grid></nve-card>`)]
        },
        {
          code: `<nve-card><nve-accordion></nve-accordion></nve-card>`,
          errors: [
            nestedError(
              'nve-accordion',
              'nve-card',
              `<nve-card><nve-accordion container="flat"></nve-accordion></nve-card>`
            )
          ]
        },
        {
          code: `<nve-card><nve-accordion-group></nve-accordion-group></nve-card>`,
          errors: [
            nestedError(
              'nve-accordion-group',
              'nve-card',
              `<nve-card><nve-accordion-group container="flat"></nve-accordion-group></nve-card>`
            )
          ]
        }
      ]
    });
  });

  it('should report when container has wrong value', () => {
    tester.run('wrong container value', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-card-content><nve-grid container="default"></nve-grid></nve-card-content>`,
          errors: [
            nestedError(
              'nve-grid',
              'nve-card-content',
              `<nve-card-content><nve-grid container="flat"></nve-grid></nve-card-content>`
            )
          ]
        }
      ]
    });
  });

  it('should detect nested containers through intermediate elements', () => {
    tester.run('deeply nested containers', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-card-content><div><nve-grid></nve-grid></div></nve-card-content>`,
          errors: [
            nestedError(
              'nve-grid',
              'nve-card-content',
              `<nve-card-content><div><nve-grid container="flat"></nve-grid></div></nve-card-content>`
            )
          ]
        }
      ]
    });
  });
});
