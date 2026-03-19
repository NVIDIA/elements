// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noMissingControlLabel from './no-missing-control-label.js';

const rule = noMissingControlLabel as unknown as JSRuleDefinition;

describe('noMissingControlLabel', () => {
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
    expect(noMissingControlLabel.meta).toBeDefined();
    expect(noMissingControlLabel.meta.type).toBe('problem');
    expect(noMissingControlLabel.meta.docs).toBeDefined();
    expect(noMissingControlLabel.meta.docs.description).toBe('Require form controls to have an accessible label.');
    expect(noMissingControlLabel.meta.docs.category).toBe('Accessibility');
    expect(noMissingControlLabel.meta.docs.recommended).toBe(true);
    expect(noMissingControlLabel.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noMissingControlLabel.meta.schema).toBeDefined();
    expect(noMissingControlLabel.meta.messages).toBeDefined();
    expect(noMissingControlLabel.meta.messages['missing-control-label']).toBe(
      '<{{element}}> is missing an accessible label. Add a aria-label attribute on the native input.'
    );
  });

  it('should allow form controls with slotted label', () => {
    tester.run('should allow form controls with slotted label', rule, {
      valid: [
        `<nve-input>
          <label>Name</label>
          <input type="text" />
        </nve-input>`,
        `<nve-textarea>
          <label>Description</label>
          <textarea></textarea>
        </nve-textarea>`,
        `<nve-select>
          <label>Choose option</label>
          <select>
            <option>Option 1</option>
          </select>
        </nve-select>`,
        `<nve-date>
          <label>Date</label>
          <input type="date" />
        </nve-date>`,
        `<nve-search>
          <label>Search</label>
          <input type="search" />
        </nve-search>`,
        `<nve-checkbox>
          <label>Accept terms</label>
          <input type="checkbox" />
        </nve-checkbox>`,
        `<nve-radio>
          <label>Option A</label>
          <input type="radio" />
        </nve-radio>`,
        `<nve-switch>
          <label>Enable feature</label>
          <input type="checkbox" />
        </nve-switch>`
      ],
      invalid: []
    });
  });

  it('should allow form controls with aria-label on native input', () => {
    tester.run('should allow form controls with aria-label', rule, {
      valid: [
        `<nve-input>
          <input type="text" aria-label="Name" />
        </nve-input>`,
        `<nve-textarea>
          <textarea aria-label="Description"></textarea>
        </nve-textarea>`,
        `<nve-select>
          <select aria-label="Choose option">
            <option>Option 1</option>
          </select>
        </nve-select>`,
        `<nve-date>
          <input type="date" aria-label="Date" />
        </nve-date>`,
        `<nve-search>
          <input type="search" aria-label="Search" />
        </nve-search>`,
        `<nve-checkbox>
          <input type="checkbox" aria-label="Accept terms" />
        </nve-checkbox>`,
        `<nve-radio>
          <input type="radio" aria-label="Option A" />
        </nve-radio>`,
        `<nve-switch>
          <input type="checkbox" aria-label="Enable feature" />
        </nve-switch>`
      ],
      invalid: []
    });
  });

  it('should allow non-form-control elements without labels', () => {
    tester.run('should allow non-form-control elements', rule, {
      valid: [
        `<nve-button>Click me</nve-button>`,
        `<nve-card>Content</nve-card>`,
        `<nve-badge>Badge</nve-badge>`,
        `<div>Regular div</div>`
      ],
      invalid: []
    });
  });

  it('should skip validation when template syntax is detected', () => {
    tester.run('should skip validation with template syntax', rule, {
      valid: [
        `<nve-input>\${}</nve-input>`,
        `<nve-input>{{ }}</nve-input>`,
        `<nve-input>{% %}</nve-input>`,
        `<nve-textarea>\${dynamicContent}</nve-textarea>`,
        `<nve-select>{{options}}</nve-select>`
      ],
      invalid: []
    });
  });

  it('should report missing label on form controls', () => {
    tester.run('should report missing label', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-input><input type="text" /></nve-input>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-input' } }]
        },
        {
          code: `<nve-textarea><textarea></textarea></nve-textarea>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-textarea' } }]
        },
        {
          code: `<nve-select><select><option>Opt</option></select></nve-select>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-select' } }]
        },
        {
          code: `<nve-date><input type="date" /></nve-date>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-date' } }]
        },
        {
          code: `<nve-datetime><input type="datetime-local" /></nve-datetime>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-datetime' } }]
        },
        {
          code: `<nve-time><input type="time" /></nve-time>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-time' } }]
        },
        {
          code: `<nve-search><input type="search" /></nve-search>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-search' } }]
        },
        {
          code: `<nve-file><input type="file" /></nve-file>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-file' } }]
        },
        {
          code: `<nve-password><input type="password" /></nve-password>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-password' } }]
        },
        {
          code: `<nve-color><input type="color" /></nve-color>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-color' } }]
        },
        {
          code: `<nve-range><input type="range" /></nve-range>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-range' } }]
        },
        {
          code: `<nve-combobox><input type="search" /><option>Opt</option></nve-combobox>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-combobox' } }]
        },
        {
          code: `<nve-checkbox><input type="checkbox" /></nve-checkbox>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-checkbox' } }]
        },
        {
          code: `<nve-radio><input type="radio" /></nve-radio>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-radio' } }]
        },
        {
          code: `<nve-switch><input type="checkbox" /></nve-switch>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-switch' } }]
        }
      ]
    });
  });

  it('should report missing label on empty form controls', () => {
    tester.run('should report missing label on empty controls', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-input></nve-input>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-input' } }]
        },
        {
          code: `<nve-textarea></nve-textarea>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'nve-textarea' } }]
        }
      ]
    });
  });

  it('should support additionalControls option', () => {
    tester.run('should support additionalControls option', rule, {
      valid: [
        {
          options: [{ additionalControls: ['custom-input'] }],
          code: `<custom-input><label>Label</label><input /></custom-input>`
        }
      ],
      invalid: [
        {
          options: [{ additionalControls: ['custom-input'] }],
          code: `<custom-input><input /></custom-input>`,
          errors: [{ messageId: 'missing-control-label', data: { element: 'custom-input' } }]
        }
      ]
    });
  });
});
