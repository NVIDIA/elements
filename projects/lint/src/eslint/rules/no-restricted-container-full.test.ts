// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import noRestrictedContainerFull from './no-restricted-container-full.js';

const rule = noRestrictedContainerFull as unknown as JSRuleDefinition;

function restrictedContainerFullError(tag: string) {
  return {
    messageId: 'no-restricted-container-full' as const,
    data: { tag }
  };
}

function gridRequiresContainerFlatError(parent: string, output: string) {
  return {
    messageId: 'grid-requires-container-flat' as const,
    data: { parent },
    suggestions: [{ messageId: 'suggest-container-flat' as const, output }]
  };
}

describe('noRestrictedContainerFull', () => {
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
    expect(noRestrictedContainerFull.meta).toBeDefined();
    expect(noRestrictedContainerFull.meta.type).toBe('problem');
    expect(noRestrictedContainerFull.meta.docs).toBeDefined();
    expect(noRestrictedContainerFull.meta.docs.description).toBe(
      'Restrict container="full" to direct children of nve-page.'
    );
    expect(noRestrictedContainerFull.meta.docs.category).toBe('Best Practice');
    expect(noRestrictedContainerFull.meta.docs.recommended).toBe(true);
    expect(noRestrictedContainerFull.meta.docs.url).toContain('/docs/lint/');
    expect(noRestrictedContainerFull.meta.schema).toEqual([]);
    expect(noRestrictedContainerFull.meta.messages['no-restricted-container-full']).toBe(
      'container="full" on <{{tag}}> requires the element to be the template root or a direct child of <nve-page>.'
    );
    expect(noRestrictedContainerFull.meta.messages['grid-requires-container-flat']).toBe(
      '<nve-grid> inside <{{parent}}> requires container="flat". Use container="full" only when the grid is the template root or a direct child of <nve-page>.'
    );
    expect(noRestrictedContainerFull.meta.messages['suggest-container-flat']).toBe(
      'Replace container="full" with container="flat"'
    );
  });

  it('should register the rule as a recommended error', () => {
    const plugin = elementsHtmlConfig.plugins?.['@nvidia-elements/lint'];

    expect(plugin?.rules?.['no-restricted-container-full']).toBe(noRestrictedContainerFull);
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-restricted-container-full']).toEqual(['error']);
  });

  it('should allow full containers as direct children of nve-page', () => {
    tester.run('direct nve-page children', rule, {
      valid: [
        '<nve-page><nve-alert-group container="full"></nve-alert-group></nve-page>',
        '<nve-page><nve-card container="full"></nve-card></nve-page>',
        '<nve-page><nve-grid container="full"></nve-grid></nve-page>',
        '<nve-page><nve-toolbar container="full"></nve-toolbar></nve-page>',
        '<nve-page><nve-toolbar slot="subheader" container="full"></nve-toolbar></nve-page>'
      ],
      invalid: []
    });
  });

  it('should allow full containers as template roots', () => {
    tester.run('template root elements', rule, {
      valid: [
        '<nve-alert-group container="full"></nve-alert-group>',
        '<nve-card container="full"></nve-card>',
        '<nve-grid container="full"></nve-grid>',
        '<nve-toolbar container="full"></nve-toolbar>'
      ],
      invalid: []
    });
  });

  it('should allow a full container as the root of a tagged template', () => {
    const javascriptTester = new RuleTester({
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    });

    javascriptTester.run('tagged template root element', rule, {
      valid: [
        `const template = html\`
          <nve-grid container="full">
            <nve-grid-header></nve-grid-header>
          </nve-grid>
        \`;`
      ],
      invalid: [
        {
          code: `const template = html\`
            <main>
              <nve-grid container="full"></nve-grid>
            </main>
          \`;`,
          errors: [restrictedContainerFullError('nve-grid')]
        }
      ]
    });
  });

  it('should ignore container values other than the static full value', () => {
    tester.run('other container values', rule, {
      valid: [
        '<nve-card container="flat"></nve-card>',
        '<nve-grid></nve-grid>',
        '<nve-toolbar container="${container}"></nve-toolbar>',
        '<nve-alert-group container="{{ container }}"></nve-alert-group>',
        '<nve-unknown container="full"></nve-unknown>'
      ],
      invalid: []
    });
  });

  it('should report full containers without a supported parent', () => {
    tester.run('unsupported parents', rule, {
      valid: [],
      invalid: [
        {
          code: '<main><nve-card container="full"></nve-card></main>',
          errors: [restrictedContainerFullError('nve-card')]
        },
        {
          code: '<nve-toolbar><nve-grid container="full"></nve-grid></nve-toolbar>',
          errors: [restrictedContainerFullError('nve-grid')]
        },
        {
          code: '<nve-card><nve-toolbar container="full"></nve-toolbar></nve-card>',
          errors: [restrictedContainerFullError('nve-toolbar')]
        }
      ]
    });
  });

  it('should require the supported parent to be direct', () => {
    tester.run('indirect supported parents', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-page><main><nve-card container="full"></nve-card></main></nve-page>',
          errors: [restrictedContainerFullError('nve-card')]
        },
        {
          code: '<nve-card><nve-card-content><nve-grid container="full"></nve-grid></nve-card-content></nve-card>',
          errors: [
            gridRequiresContainerFlatError(
              'nve-card',
              '<nve-card><nve-card-content><nve-grid container="flat"></nve-grid></nve-card-content></nve-card>'
            )
          ]
        },
        {
          code: '<nve-dialog><div><nve-grid container="full"></nve-grid></div></nve-dialog>',
          errors: [
            gridRequiresContainerFlatError(
              'nve-dialog',
              '<nve-dialog><div><nve-grid container="flat"></nve-grid></div></nve-dialog>'
            )
          ]
        }
      ]
    });
  });

  it('should report a full grid directly inside card and dialog containers', () => {
    tester.run('full nve-grid in flat-only containers', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-card><nve-grid container="full"></nve-grid></nve-card>',
          errors: [
            gridRequiresContainerFlatError('nve-card', '<nve-card><nve-grid container="flat"></nve-grid></nve-card>')
          ]
        },
        {
          code: '<nve-dialog><nve-grid container="full"></nve-grid></nve-dialog>',
          errors: [
            gridRequiresContainerFlatError(
              'nve-dialog',
              '<nve-dialog><nve-grid container="flat"></nve-grid></nve-dialog>'
            )
          ]
        }
      ]
    });
  });
});
