// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import htmlParser from '@html-eslint/parser';
import rule from './no-invalid-virtual-list.js';
import { elementsHtmlConfig } from '../configs/html.js';

describe('no-invalid-virtual-list', () => {
  it('registers a recommended rule', () => {
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-invalid-virtual-list']).toEqual(['error']);
  });

  it('requires binding syntax for geometry property names', () => {
    const tester = new RuleTester({ languageOptions: { parser: htmlParser } });
    tester.run('geometry property bindings', rule, {
      valid: [
        '<nve-virtual-list itemCount={100} itemHeight={40}></nve-virtual-list>',
        '<nve-virtual-list itemCount={items.length + 1} itemHeight={rowHeight}></nve-virtual-list>',
        '<nve-virtual-list itemCount={ getCount() } itemHeight={40}></nve-virtual-list>',
        '<nve-virtual-list itemCount="100" item-count="100" itemHeight="40" item-height="40"></nve-virtual-list>'
      ],
      invalid: [
        ...['"100"', '100', '"{count}"', '"{{count}}"', '${count}'].map(value => ({
          code: `<nve-virtual-list itemCount=${value} item-height="40"></nve-virtual-list>`,
          errors: [{ messageId: 'geometry', data: { attribute: 'item-count' } }]
        })),
        ...['"40"', '40', '"{height}"', '"{{height}}"', '${height}'].map(value => ({
          code: `<nve-virtual-list item-count="100" itemHeight=${value}></nve-virtual-list>`,
          errors: [{ messageId: 'geometry', data: { attribute: 'item-height' } }]
        })),
        {
          code: '<nve-virtual-list itemCount="100" itemHeight="40"></nve-virtual-list>',
          errors: [
            { messageId: 'geometry', data: { attribute: 'item-count' } },
            { messageId: 'geometry', data: { attribute: 'item-height' } }
          ]
        }
      ]
    });
  });

  it('accepts supported geometry bindings and rejects provably invalid inputs and grid compositions', () => {
    const tester = new RuleTester({ languageOptions: { parser: htmlParser } });
    tester.run('no-invalid-virtual-list', rule, {
      valid: [
        '<nve-virtual-list item-count="400000" item-height="40"></nve-virtual-list>',
        '<nve-virtual-list item-count="400001" .itemHeight=${height}></nve-virtual-list>',
        '<nve-grid><ng-container><ng-container><nve-virtual-list item-count="1" item-height="40"><ng-container><ng-container><nve-grid-row></nve-grid-row></ng-container></ng-container></nve-virtual-list></ng-container></ng-container></nve-grid>',
        '<nve-virtual-list item-count="0" item-height="40"></nve-virtual-list>',
        '<nve-virtual-list .itemCount=${count} .itemHeight=${height}></nve-virtual-list>',
        '<nve-virtual-list [itemCount]="count" [itemHeight]="height"></nve-virtual-list>',
        '<nve-virtual-list :item-count="count" :item-height="height"></nve-virtual-list>',
        '<nve-virtual-list v-bind:item-count="count" v-bind:item-height="height"></nve-virtual-list>',
        '<nve-virtual-list itemCount={count} itemHeight={height}></nve-virtual-list>',
        '<nve-virtual-list item-count="{{count}}" item-height="{{height}}"></nve-virtual-list>',
        '<nve-virtual-list item-count="1" item-height="40"><article>Standalone</article><nve-panel></nve-panel></nve-virtual-list>',
        '<nve-grid><nve-virtual-list item-count="1" item-height="40"><nve-grid-row><nve-grid-cell><nve-icon-button icon-name="more-actions"></nve-icon-button></nve-grid-cell></nve-grid-row></nve-virtual-list></nve-grid>',
        '<nve-page-panel><nve-grid><nve-virtual-list item-count="1" item-height="40"></nve-virtual-list></nve-grid></nve-page-panel>',
        { filename: 'doc.md', code: 'Use `<nve-virtual-list>` for a viewport.' },
        {
          filename: 'doc.md',
          code: 'Use `<nve-grid><nve-virtual-list></nve-virtual-list></nve-grid>` for a viewport.'
        },
        { filename: 'doc.md', code: 'Use `<div><section><nve-virtual-list></nve-virtual-list></section></div>`.' }
      ],
      invalid: [
        {
          filename: 'doc.md',
          code: '```html\n<nve-grid><nve-virtual-list></nve-virtual-list></nve-grid>\n```',
          errors: [{ messageId: 'geometry' }, { messageId: 'geometry' }]
        },
        {
          filename: 'doc.md',
          code: '<div><nve-virtual-list></nve-virtual-list></div>',
          errors: [{ messageId: 'geometry' }, { messageId: 'geometry' }]
        },
        {
          code: '<nve-virtual-list item-count="400001" item-height="40"></nve-virtual-list>',
          errors: [{ messageId: 'geometry' }]
        },
        ...['<div></div>', '<ng-container><ng-container><div></div></ng-container></ng-container>'].flatMap(content =>
          ['', '<ng-container><ng-container>'].map(wrapper => ({
            code: `<nve-grid>${wrapper}<nve-virtual-list item-count="1" item-height="40">${content}</nve-virtual-list>${wrapper ? '</ng-container></ng-container>' : ''}</nve-grid>`,
            errors: [{ messageId: 'rows' }]
          }))
        ),
        {
          code: '<nve-grid><ng-container><ng-container><nve-virtual-list item-count="1" item-height="40"><ng-container><nve-grid-row><nve-grid-cell><nve-panel></nve-panel></nve-grid-cell></nve-grid-row></ng-container></nve-virtual-list></ng-container></ng-container></nve-grid>',
          errors: [{ messageId: 'composition' }]
        },
        {
          code: '<nve-virtual-list></nve-virtual-list>',
          errors: [{ messageId: 'geometry' }, { messageId: 'geometry' }]
        },
        ...['', ' ', '-1', '1.5', 'Infinity', '9007199254740992'].map(value => ({
          code: `<nve-virtual-list item-count="${value}" item-height="40"></nve-virtual-list>`,
          errors: [{ messageId: 'geometry' }]
        })),
        {
          code: '<nve-virtual-list item-count="1" item-height="0"></nve-virtual-list>',
          errors: [{ messageId: 'geometry' }]
        },
        ...[
          '<div role="rowgroup"></div>',
          '<nve-page-panel></nve-page-panel>',
          '<nve-grid-row aria-expanded="true"></nve-grid-row>',
          '<nve-grid-row><nve-grid-cell><nve-icon-button icon-name="caret" direction="down"></nve-icon-button></nve-grid-cell></nve-grid-row>',
          '<nve-grid-row><nve-grid-cell><nve-icon-button icon-name="expand-details"></nve-icon-button></nve-grid-cell></nve-grid-row>',
          '<nve-grid-row><nve-grid-cell><nve-panel></nve-panel></nve-grid-cell></nve-grid-row>'
        ].map(content => ({
          code: `<nve-grid><nve-virtual-list item-count="1" item-height="40">${content}</nve-virtual-list></nve-grid>`,
          errors: [{ messageId: 'composition' }]
        }))
      ]
    });
  });
});
