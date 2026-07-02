// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import preferAriaLabelInCompactContainers from './prefer-aria-label-in-compact-containers.js';

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null;
}

function isJSRuleDefinition(rule: unknown): rule is JSRuleDefinition {
  if (!isRecord(rule) || !isRecord(rule.meta)) {
    return false;
  }

  const { meta, create } = rule;
  return (
    typeof create === 'function' && meta.type === 'problem' && 'docs' in meta && 'schema' in meta && 'messages' in meta
  );
}

if (!isJSRuleDefinition(preferAriaLabelInCompactContainers)) {
  throw new TypeError('Expected preferAriaLabelInCompactContainers to be an ESLint rule definition.');
}

const rule = preferAriaLabelInCompactContainers;

function compactLabelError(control: string, container: string) {
  return {
    messageId: 'prefer-aria-label' as const,
    data: { control, container }
  };
}

describe('preferAriaLabelInCompactContainers', () => {
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
    expect(preferAriaLabelInCompactContainers.meta).toBeDefined();
    expect(preferAriaLabelInCompactContainers.meta.type).toBe('problem');
    expect(preferAriaLabelInCompactContainers.meta.docs).toBeDefined();
    expect(preferAriaLabelInCompactContainers.meta.docs.description).toBe(
      'Prefer aria-label on form controls inside toolbars and page headers.'
    );
    expect(preferAriaLabelInCompactContainers.meta.docs.category).toBe('Best Practice');
    expect(preferAriaLabelInCompactContainers.meta.docs.recommended).toBe(true);
    expect(preferAriaLabelInCompactContainers.meta.docs.url).toContain('/docs/lint/');
    expect(preferAriaLabelInCompactContainers.meta.schema).toEqual([]);
    expect(preferAriaLabelInCompactContainers.meta.messages['prefer-aria-label']).toBe(
      'Remove <label> from <{{control}}> inside <{{container}}> and use aria-label instead to preserve the compact layout.'
    );
  });

  it('should register the rule as a recommended error', () => {
    const plugin = elementsHtmlConfig.plugins?.['@nvidia-elements/lint'];

    expect(plugin?.rules?.['prefer-aria-label-in-compact-containers']).toBe(preferAriaLabelInCompactContainers);
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/prefer-aria-label-in-compact-containers']).toEqual([
      'error'
    ]);
  });

  it('should allow labels that do not affect compact form controls', () => {
    tester.run('allowed labels', rule, {
      valid: [
        `<nve-input><label>Name</label><input /></nve-input>`,
        `<nve-toolbar><label nve-text="body sm">1 of 13</label></nve-toolbar>`,
        `<nve-page-header><nve-button><label>Action</label></nve-button></nve-page-header>`,
        `<nve-toolbar><div><label>Caption</label></div></nve-toolbar>`
      ],
      invalid: []
    });
  });

  it('should allow compact form controls without visual labels', () => {
    tester.run('aria labels', rule, {
      valid: [
        `<nve-toolbar><nve-input><input aria-label="Search" /></nve-input></nve-toolbar>`,
        `<nve-page-header><nve-select><select aria-label="Page"><option>One</option></select></nve-select></nve-page-header>`,
        `<nve-toolbar><nve-input><input /></nve-input></nve-toolbar>`
      ],
      invalid: []
    });
  });

  it('should report labels in compact form controls', () => {
    tester.run('compact control labels', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-toolbar><nve-input><label>Search</label><input /></nve-input></nve-toolbar>`,
          errors: [compactLabelError('nve-input', 'nve-toolbar')]
        },
        {
          code: `<nve-page-header><nve-search slot="suffix"><label>Search</label><input type="search" /></nve-search></nve-page-header>`,
          errors: [compactLabelError('nve-search', 'nve-page-header')]
        },
        {
          code: `<nve-toolbar><div><nve-select><label>Page</label><select></select></nve-select></div></nve-toolbar>`,
          errors: [compactLabelError('nve-select', 'nve-toolbar')]
        },
        {
          code: `<nve-page-header><nve-star-rating><span><label>Rating</label></span><input type="range" /></nve-star-rating></nve-page-header>`,
          errors: [compactLabelError('nve-star-rating', 'nve-page-header')]
        },
        {
          code: `<nve-toolbar><nve-input><label>Name</label><input aria-label="Name" /></nve-input></nve-toolbar>`,
          errors: [compactLabelError('nve-input', 'nve-toolbar')]
        }
      ]
    });
  });

  it('should report each label against its nearest form control', () => {
    tester.run('nested form controls', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-toolbar>
            <nve-checkbox-group>
              <label>Options</label>
              <nve-checkbox><label>First</label><input type="checkbox" /></nve-checkbox>
            </nve-checkbox-group>
          </nve-toolbar>`,
          errors: [
            compactLabelError('nve-checkbox-group', 'nve-toolbar'),
            compactLabelError('nve-checkbox', 'nve-toolbar')
          ]
        }
      ]
    });
  });
});
