// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assert, beforeEach, describe, expect, it } from 'vitest';
import { Linter, RuleTester, type JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { nodeTypescriptConfig } from '@internals/eslint';
import { elementsHtmlConfig } from '../configs/html.js';
import noExcessivePopoverInstances from './no-excessive-popover-instances.js';

const rule = noExcessivePopoverInstances as unknown as JSRuleDefinition;
const popovers = ['nve-tooltip', 'nve-toggletip', 'nve-dropdown', 'nve-dialog', 'nve-toast'];
const copies = (tagName: string, count: number) => `<${tagName}></${tagName}>`.repeat(count);

describe('noExcessivePopoverInstances', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({ languageOptions: { parser: htmlParser } });
  });

  it('should register as a performance warning', () => {
    expect(elementsHtmlConfig.plugins?.['@nvidia-elements/lint']?.rules?.['no-excessive-popover-instances']).toBe(
      noExcessivePopoverInstances
    );
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-excessive-popover-instances']).toEqual(['warn']);
  });

  it.each(popovers)('should warn once when a template exceeds 50 %s instances', tagName => {
    tester.run('literal instance budget', rule, {
      valid: [copies(tagName, 50)],
      invalid: [
        {
          code: copies(tagName, 100),
          errors: [{ messageId: 'excessive-popovers', data: { element: tagName, count: '100', max: '50' } }]
        }
      ]
    });
  });

  it('should count each popover type separately and allow small static grids', () => {
    tester.run('separate budgets', rule, {
      valid: [
        popovers.map(tag => copies(tag, 50)).join(''),
        '<nve-grid><nve-grid-row><nve-grid-cell><nve-tooltip>Help</nve-tooltip></nve-grid-cell></nve-grid-row></nve-grid>',
        '<nve-drawer v-for="item in items"></nve-drawer>'
      ],
      invalid: []
    });
  });

  it('should isolate independent templates and documentation examples', () => {
    tester.run('render scopes', rule, {
      valid: [
        `<template>${copies('nve-tooltip', 30)}</template><template>${copies('nve-tooltip', 30)}</template>`,
        `<section v-if="condition">${copies('nve-tooltip', 30)}</section><section v-else>${copies('nve-tooltip', 30)}</section>`,
        {
          filename: 'src/example.js',
          code: `const a = html\`${copies('nve-tooltip', 30)}\`; const b = html\`${copies('nve-tooltip', 30)}\`;`
        },
        {
          filename: 'src/example.tsx',
          code: `const a = <div>${copies('nve-tooltip', 30)}</div>; const b = <div>${copies('nve-tooltip', 30)}</div>;`
        },
        {
          filename: 'src/example.md',
          code: `\`\`\`html\n${copies('nve-tooltip', 30)}\n\`\`\`\n\n\`\`\`html\n${copies('nve-tooltip', 30)}\n\`\`\``
        }
      ],
      invalid: [
        {
          filename: 'src/example.ts',
          code: `const view = html\`${copies('nve-tooltip', 51)}\`;`,
          errors: [{ messageId: 'excessive-popovers' }]
        }
      ]
    });
  });

  it('should aggregate coexisting conditional instances', () => {
    const half = copies('nve-tooltip', 30);
    tester.run('coexisting conditional budgets', rule, {
      valid: [
        {
          filename: 'src/example.tsx',
          code: `const view = <div>{condition ? <section>${half}</section> : <section>${half}</section>}</div>;`
        }
      ],
      invalid: [
        { code: `<section *ngIf="first">${half}</section><section *ngIf="second">${half}</section>` },
        { code: `<ng-template [ngIf]="first">${half}</ng-template><ng-template [ngIf]="second">${half}</ng-template>` },
        { code: `<section v-if="first">${half}</section><section v-if="second">${half}</section>` },
        {
          filename: 'src/example.tsx',
          code: `const view = <div>${half}{condition && <section>${half}</section>}</div>;`
        }
      ].map(test => ({
        ...test,
        errors: [{ messageId: 'excessive-popovers', data: { element: 'nve-tooltip', count: '60', max: '50' } }]
      }))
    });
  });

  it.each(['v-for="row in rows"', '*ngFor="let row of rows"', 'ngFor [ngForOf]="rows"'])(
    'should detect repeated markup with %s',
    attribute => {
      tester.run('framework repetition', rule, {
        valid: [`<nve-tooltip id="shared"></nve-tooltip><button ${attribute} interestfor="shared">Help</button>`],
        invalid: [
          {
            code: `<div ${attribute}><nve-tooltip>Help</nve-tooltip></div>`,
            errors: [{ messageId: 'repeated-popover' }]
          }
        ]
      });
    }
  );

  it.each([
    {
      filename: 'src/example.ts',
      code: 'const render = rows => rows.map(row => html`<nve-grid-row><nve-grid-cell><nve-tooltip>${row.title}</nve-tooltip></nve-grid-cell></nve-grid-row>`);'
    },
    {
      filename: 'src/example.js',
      code: 'const render = rows => rows.flatMap(row => html`<nve-tooltip>${row.title}</nve-tooltip>`);'
    },
    {
      filename: 'src/example.js',
      code: 'const render = rows => repeat(rows, row => row.id, row => html`<nve-tooltip>${row.title}</nve-tooltip>`);'
    },
    {
      filename: 'src/example.js',
      code: 'for (const row of rows) { views.push(html`<nve-tooltip>${row.title}</nve-tooltip>`); }'
    },
    {
      filename: 'src/example.tsx',
      code: 'const render = rows => rows.map(row => <div><nve-tooltip>{row.title}</nve-tooltip></div>);'
    }
  ])('should detect repeated script templates in $filename', ({ filename, code }) => {
    tester.run('script repetition', rule, {
      valid: [],
      invalid: [{ filename, code, errors: [{ messageId: 'repeated-popover' }] }]
    });
  });

  it('should use a consumer TypeScript parser for typed callback templates', () => {
    const parser = nodeTypescriptConfig.find(config => config.languageOptions?.parser)?.languageOptions?.parser;
    assert.exists(parser);
    const typedTester = new RuleTester({ languageOptions: { parser } });
    typedTester.run('typed repetition', rule, {
      valid: ['const view = html`<nve-tooltip>${rows.map((row: Row) => row.title)}</nve-tooltip>`;'],
      invalid: [
        {
          code: 'const views = rows.map((row: Row) => html`<nve-tooltip>${row.title}</nve-tooltip>`);',
          errors: [{ messageId: 'repeated-popover' }]
        }
      ]
    });
  });

  it('should leave opaque syntax and externally declared renderers to runtime counting', () => {
    tester.run('unknown cardinality', rule, {
      valid: [
        {
          filename: 'src/example.ts',
          code: 'type Row = { title: string }; const views = rows.map((row: Row) => html`<nve-tooltip>${row.title}</nve-tooltip>`);'
        },
        {
          filename: 'src/example.js',
          code: 'const renderRow = row => html`<nve-tooltip>${row.title}</nve-tooltip>`; const views = rows.map(renderRow);'
        },
        { filename: 'src/example.md', code: 'Use `<nve-tooltip>` for details.' }
      ],
      invalid: []
    });
  });

  it('should expose the companion diagnostic at warning severity in the recommended config', () => {
    const messages = new Linter().verify(
      'const views = rows.map(row => html`<button interestfor=${row.id}>Help</button><nve-tooltip id=${row.id}>Details</nve-tooltip>`);',
      [elementsHtmlConfig],
      { filename: 'src/example.ts' }
    );
    expect(messages).toEqual([
      expect.objectContaining({
        ruleId: '@nvidia-elements/lint/no-excessive-popover-instances',
        messageId: 'repeated-popover',
        severity: 1
      })
    ]);
  });
});
