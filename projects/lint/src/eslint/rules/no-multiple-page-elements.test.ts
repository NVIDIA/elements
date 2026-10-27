// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { Linter, RuleTester, type JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import noMultiplePageElements from './no-multiple-page-elements.js';

const rule = noMultiplePageElements as unknown as JSRuleDefinition;

describe('noMultiplePageElements', () => {
  let tester: RuleTester;
  beforeEach(() => {
    tester = new RuleTester({ languageOptions: { parser: htmlParser } });
  });

  it('should register as a structural error', () => {
    expect(elementsHtmlConfig.plugins?.['@nvidia-elements/lint']?.rules?.['no-multiple-page-elements']).toBe(
      noMultiplePageElements
    );
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-multiple-page-elements']).toEqual(['error']);
  });

  it('should allow one shell in each independent template', () => {
    tester.run('independent shells', rule, {
      valid: [
        '<nve-page></nve-page>',
        '<template><nve-page></nve-page></template><template><nve-page></nve-page></template>',
        '<section v-if="condition"><nve-page></nve-page></section><section v-else><nve-page></nve-page></section>',
        {
          filename: 'src/example.ts',
          code: 'const a = html`<nve-page></nve-page>`; const b = html`<nve-page></nve-page>`;'
        },
        { filename: 'src/example.tsx', code: 'const a = <nve-page />; const b = <nve-page />;' },
        { filename: 'src/example.tsx', code: 'const view = <div>{condition ? <nve-page /> : <nve-page />}</div>;' },
        {
          filename: 'src/example.md',
          code: '```html\n<nve-page></nve-page>\n```\n\n```html\n<nve-page></nve-page>\n```'
        },
        { filename: 'src/example.md', code: 'Use `<nve-page>` as the shell.' }
      ],
      invalid: []
    });
  });

  it('should count coexisting JSX inclusions in their containing scope', () => {
    tester.run('coexisting JSX inclusions', rule, {
      valid: [
        { filename: 'src/example.tsx', code: 'const view = <div>{condition ? <nve-page /> : <nve-page />}</div>;' },
        {
          filename: 'src/example.tsx',
          code: 'const view = <div>{first ? <nve-page /> : second ? <nve-page /> : <nve-page />}</div>;'
        },
        { filename: 'src/example.tsx', code: 'const a = first && <nve-page />; const b = second && <nve-page />;' }
      ],
      invalid: [
        'const view = <div><nve-page />{condition && <nve-page />}</div>;',
        'const view = <div>{first && <nve-page />}{second && <nve-page />}</div>;',
        'const view = <><nve-page />{first && second && <section><nve-page /></section>}</>;',
        'const view = <div><nve-page />{condition || <nve-page />}</div>;',
        'const view = <div><nve-page />{value ?? <nve-page />}</div>;',
        'const view = <div><nve-page />{<nve-page />}</div>;',
        'const view = <div>{condition ? <><nve-page /><nve-page /></> : <nve-page />}</div>;'
      ].map(code => ({ filename: 'src/example.tsx', code, errors: [{ messageId: 'multiple-pages' }] }))
    });
  });

  it('should count independent conditions in their containing scope', () => {
    tester.run('independent markup conditions', rule, {
      valid: [
        '<section *ngIf="condition; else alternative"><nve-page></nve-page></section><ng-template #alternative><nve-page></nve-page></ng-template>',
        '<template v-if="condition"><nve-page></nve-page></template><template v-else><nve-page></nve-page></template>',
        '<section v-if="first"><nve-page></nve-page></section><section v-else-if="second"><nve-page></nve-page></section><section v-else><nve-page></nve-page></section>'
      ],
      invalid: [
        '<section *ngIf="first"><nve-page></nve-page></section><section *ngIf="second"><nve-page></nve-page></section>',
        '<section [ngIf]="first"><nve-page></nve-page></section><section [ngIf]="second"><nve-page></nve-page></section>',
        '<ng-template [ngIf]="first"><nve-page></nve-page></ng-template><ng-template [ngIf]="second"><nve-page></nve-page></ng-template>',
        '<nve-page></nve-page><section *ngIf="condition"><nve-page></nve-page></section>',
        '<section *ngIf="first"><nve-page></nve-page><section *ngIf="second"><nve-page></nve-page></section></section>',
        '<section v-if="first"><nve-page></nve-page></section><section v-if="second"><nve-page></nve-page></section>',
        '<template v-if="first"><nve-page></nve-page></template><template v-if="second"><nve-page></nve-page></template>',
        '<nve-page></nve-page><section v-if="condition"><nve-page></nve-page></section>'
      ].map(code => ({ code, errors: [{ messageId: 'multiple-pages' }] }))
    });
  });

  it.each([
    { name: 'LF', newline: '\n' },
    { name: 'CRLF', newline: '\r\n' }
  ])('should isolate fenced examples with $name line endings', ({ newline }) => {
    const examples = ['```', '~~~'].flatMap(fence =>
      ['', newline].flatMap(ending =>
        ['', ' ', '\t', ' \t '].map(trailing => ({
          valid:
            `${fence}html\n<nve-page></nve-page>\n${fence}${trailing}\n\n${fence}html\n<nve-page></nve-page>\n${fence}${trailing}`.replaceAll(
              '\n',
              newline
            ) + ending,
          invalid:
            `${fence}html\n<nve-page></nve-page>\n${fence}${trailing}\n\n${fence}html\n<nve-page></nve-page><nve-page></nve-page>\n${fence}${trailing}`.replaceAll(
              '\n',
              newline
            ) + ending
        }))
      )
    );
    tester.run('fenced render scopes', rule, {
      valid: examples.map(example => ({ filename: 'src/example.md', code: example.valid })),
      invalid: examples.map(example => ({
        filename: 'src/example.md',
        code: example.invalid,
        errors: [{ messageId: 'multiple-pages' }]
      }))
    });
  });

  it('should count unconditional siblings with compatible alternative branches', () => {
    tester.run('alternative branch compatibility', rule, {
      valid: [
        '<section v-if="condition"><nve-page></nve-page></section><section v-else><nve-page></nve-page></section>',
        '<nve-page v-if="condition"></nve-page>\n<!-- alternative -->\n<nve-page v-else></nve-page>',
        '<section v-if="outer"><div v-if="inner"><nve-page></nve-page></div><div v-else><nve-page></nve-page></div></section><section v-else><nve-page></nve-page></section>',
        '<nve-page></nve-page><template><section v-if="condition"></section><section v-else><nve-page></nve-page></section></template>',
        {
          filename: 'src/example.md',
          code: '```html\n<section v-if="first"></section><section v-else><nve-page></nve-page></section>\n```\n\n```html\n<nve-page></nve-page>\n```'
        }
      ],
      invalid: [
        '<nve-page></nve-page><section v-if="condition"></section><section v-else><nve-page></nve-page></section>',
        '<section v-if="condition"></section><section v-else><nve-page></nve-page></section><nve-page></nve-page>',
        '<nve-page></nve-page><section v-if="first"></section><section v-else-if="second"><nve-page></nve-page></section><section v-else></section>',
        '<nve-page></nve-page><template v-if="condition"></template><template v-else><nve-page></nve-page></template>',
        '<section v-if="first"></section><section v-else><nve-page></nve-page></section><section v-if="second"></section><section v-else><nve-page></nve-page></section>',
        '<section v-if="outer"></section><section v-else><nve-page></nve-page><div v-if="inner"></div><div v-else><nve-page></nve-page></div></section>',
        {
          filename: 'src/example.md',
          code: '```html\n<nve-page></nve-page><section v-if="condition"></section><section v-else><nve-page></nve-page></section>\n```'
        }
      ].map(test => ({
        ...(typeof test === 'string' ? { code: test } : test),
        errors: [{ messageId: 'multiple-pages' }]
      }))
    });
  });

  it.each([
    { code: '<nve-page></nve-page><nve-page></nve-page>' },
    { code: '<nve-page><nve-page></nve-page></nve-page>' },
    { filename: 'src/example.ts', code: 'const view = html`<nve-page></nve-page><nve-page></nve-page>`;' },
    { filename: 'src/example.tsx', code: 'const view = <div><nve-page /><nve-page /></div>;' },
    { filename: 'src/example.md', code: '```html\n<nve-page></nve-page><nve-page></nve-page>\n```' }
  ])('should reject multiple shells in one render scope', test => {
    tester.run('multiple shells', rule, {
      valid: [],
      invalid: [{ ...test, errors: [{ messageId: 'multiple-pages' }] }]
    });
  });

  it.each([
    { code: '<nve-page v-for="page in pages"></nve-page>' },
    { code: '<div *ngFor="let page of pages"><nve-page></nve-page></div>' },
    { filename: 'src/example.js', code: 'const views = pages.map(page => html`<nve-page>${page.title}</nve-page>`);' }
  ])('should reject page shells in repeated content', test => {
    tester.run('repeated shells', rule, {
      valid: [],
      invalid: [{ ...test, errors: [{ messageId: 'repeated-page' }] }]
    });
  });

  it('should report a structural error through the recommended HTML config', () => {
    const messages = new Linter().verify('<nve-page></nve-page><nve-page></nve-page>', [elementsHtmlConfig], {
      filename: 'src/example.html'
    });
    expect(messages).toEqual([
      expect.objectContaining({
        ruleId: '@nvidia-elements/lint/no-multiple-page-elements',
        messageId: 'multiple-pages',
        severity: 2
      })
    ]);
  });
});
