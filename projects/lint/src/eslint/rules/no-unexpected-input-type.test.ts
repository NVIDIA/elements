// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noUnexpectedInputType from './no-unexpected-input-type.js';

const rule = noUnexpectedInputType as unknown as JSRuleDefinition;

describe('noUnexpectedInputType', () => {
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
    expect(noUnexpectedInputType.meta).toBeDefined();
    expect(noUnexpectedInputType.meta.type).toBe('problem');
    expect(noUnexpectedInputType.meta.docs).toBeDefined();
    expect(noUnexpectedInputType.meta.docs.description).toBe(
      'Disallow slotted <input> elements with a type that does not match the parent Elements component.'
    );
    expect(noUnexpectedInputType.meta.docs.category).toBe('Best Practice');
    expect(noUnexpectedInputType.meta.docs.recommended).toBe(true);
    expect(noUnexpectedInputType.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noUnexpectedInputType.meta.schema).toBeDefined();
    expect(noUnexpectedInputType.meta.messages).toBeDefined();
  });

  it('should allow correctly typed inputs inside nve-input', () => {
    tester.run('allow nve-input types', rule, {
      valid: [
        `<nve-input><input type="text" /></nve-input>`,
        `<nve-input><input type="email" /></nve-input>`,
        `<nve-input><input type="number" /></nve-input>`,
        `<nve-input><input type="tel" /></nve-input>`,
        `<nve-input><input type="url" /></nve-input>`,
        // no type defaults to text, valid for nve-input
        `<nve-input><input /></nve-input>`
      ],
      invalid: []
    });
  });

  it('should allow correctly typed inputs inside specialized components', () => {
    tester.run('allow specialized types', rule, {
      valid: [
        `<nve-password><input type="password" /></nve-password>`,
        `<nve-search><input type="search" /></nve-search>`,
        `<nve-date><input type="date" /></nve-date>`,
        `<nve-time><input type="time" /></nve-time>`,
        `<nve-week><input type="week" /></nve-week>`,
        `<nve-month><input type="month" /></nve-month>`,
        `<nve-datetime><input type="datetime-local" /></nve-datetime>`,
        `<nve-checkbox><input type="checkbox" /></nve-checkbox>`,
        `<nve-radio><input type="radio" /></nve-radio>`,
        `<nve-range><input type="range" /></nve-range>`,
        `<nve-file><input type="file" /></nve-file>`
      ],
      invalid: []
    });
  });

  it('should allow inputs with labels and messages inside components', () => {
    tester.run('allow full component usage', rule, {
      valid: [
        `<nve-input>
          <label>Name</label>
          <input type="text" />
          <nve-control-message>Enter your name</nve-control-message>
        </nve-input>`,
        `<nve-date>
          <label>Birthday</label>
          <input type="date" />
          <nve-control-message>Select a date</nve-control-message>
        </nve-date>`,
        `<nve-file>
          <label>Upload</label>
          <input type="file" />
          <nve-control-message>Choose a file</nve-control-message>
        </nve-file>`
      ],
      invalid: []
    });
  });

  it('should allow inputs outside of nve components', () => {
    tester.run('allow standalone inputs', rule, {
      valid: [
        `<input type="text" />`,
        `<input type="date" />`,
        `<input type="file" />`,
        `<input />`,
        `<div><input type="checkbox" /></div>`,
        `<form><input type="password" /></form>`
      ],
      invalid: []
    });
  });

  it('should allow input types that have no nve component mapping', () => {
    tester.run('allow unmapped types inside components', rule, {
      valid: [`<nve-input><input type="hidden" /></nve-input>`, `<nve-input><input type="color" /></nve-input>`],
      invalid: []
    });
  });

  it('should allow non-nve elements with any input type', () => {
    tester.run('allow non-nve elements', rule, {
      valid: [
        `<div><input type="date" /></div>`,
        `<form><input type="file" /></form>`,
        `<span><input type="password" /></span>`
      ],
      invalid: []
    });
  });

  it('should report date input inside nve-input', () => {
    tester.run('report date in nve-input', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-input><input type="date" /></nve-input>`,
          errors: [{ messageId: 'unexpected-input-type' }]
        }
      ]
    });
  });

  it('should report text input inside nve-date', () => {
    tester.run('report text in nve-date', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-date><input type="text" /></nve-date>`,
          errors: [{ messageId: 'unexpected-input-type' }]
        }
      ]
    });
  });

  it('should report password input inside nve-input', () => {
    tester.run('report password in nve-input', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-input><input type="password" /></nve-input>`,
          errors: [{ messageId: 'unexpected-input-type' }]
        }
      ]
    });
  });

  it('should report checkbox input inside nve-input', () => {
    tester.run('report checkbox in nve-input', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-input><input type="checkbox" /></nve-input>`,
          errors: [{ messageId: 'unexpected-input-type' }]
        }
      ]
    });
  });

  it('should report no-type input inside nve-date (defaults to text)', () => {
    tester.run('report default text in nve-date', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-date><input /></nve-date>`,
          errors: [{ messageId: 'unexpected-input-type' }]
        }
      ]
    });
  });

  it('should report mismatched input with surrounding elements', () => {
    tester.run('report with full component structure', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-input>
            <label>Date</label>
            <input type="date" />
            <nve-control-message>Pick a date</nve-control-message>
          </nve-input>`,
          errors: [{ messageId: 'unexpected-input-type' }]
        }
      ]
    });
  });

  it('should report one error per mismatched input', () => {
    tester.run('one error per input', rule, {
      valid: [],
      invalid: [
        {
          code: `<div>
            <nve-input><input type="date" /></nve-input>
            <nve-date><input type="text" /></nve-date>
            <nve-input><input type="file" /></nve-input>
          </div>`,
          errors: 3
        }
      ]
    });
  });
});
