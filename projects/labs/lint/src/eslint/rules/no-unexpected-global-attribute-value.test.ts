import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import html from '@html-eslint/eslint-plugin';
import noUnexpectedGlobalAttributeValue from './no-unexpected-global-attribute-value.js';

const rule = noUnexpectedGlobalAttributeValue as unknown as JSRuleDefinition;

describe('noUnexpectedAttributeValue', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      language: 'html/html',
      languageOptions: {
        tolerant: true
      },
      plugins: {
        html
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noUnexpectedGlobalAttributeValue.meta).toBeDefined();
    expect(noUnexpectedGlobalAttributeValue.meta.type).toBe('problem');
    expect(noUnexpectedGlobalAttributeValue.meta.docs).toBeDefined();
    expect(noUnexpectedGlobalAttributeValue.meta.docs.description).toBe(
      'Disallow use of invalid attribute values in HTML.'
    );
    expect(noUnexpectedGlobalAttributeValue.meta.docs.category).toBe('Best Practice');
    expect(noUnexpectedGlobalAttributeValue.meta.docs.recommended).toBe(true);
    expect(noUnexpectedGlobalAttributeValue.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noUnexpectedGlobalAttributeValue.meta.schema).toBeDefined();
    expect(noUnexpectedGlobalAttributeValue.meta.messages).toBeDefined();
  });

  it('should allow valid use of nve-text attribute values', () => {
    tester.run('should allow valid use of nve-text attribute values', rule, {
      valid: [
        '<h2 nve-text="heading"></h2>',
        '<h2 nve-text="heading sm muted"></h2>',
        '<p nve-text="body"></p>',
        '<p nve-text="body sm muted"></p>',
        '<span nve-text="${heading}"></span>',
        '<span nve-text=${heading}></span>',
        '<span nve-text={{heading}}></span>',
        '<span nve-text={%heading%}></span>'
      ],
      invalid: []
    });
  });

  it('should not allow invalid use of nve-text attribute values', () => {
    tester.run('should not allow invalid use of nve-text attribute values', rule, {
      valid: [],
      invalid: [
        {
          code: '<h2 nve-text="heading-1"></h2>',
          errors: [{ messageId: 'unexpected-attribute-value', data: { attribute: 'nve-text', value: 'heading-1' } }]
        },
        {
          code: '<h2 nve-text="heading-1 sm muted"></h2>',
          errors: [{ messageId: 'unexpected-attribute-value', data: { attribute: 'nve-text', value: 'heading-1' } }]
        },
        {
          code: '<p nve-text="default"></p>',
          errors: [{ messageId: 'unexpected-attribute-value', data: { attribute: 'nve-text', value: 'default' } }]
        },
        {
          code: '<p nve-text="default sm muted"></p>',
          errors: [{ messageId: 'unexpected-attribute-value', data: { attribute: 'nve-text', value: 'default' } }]
        }
      ]
    });
  });

  it('should allow valid use of nve-layout attribute values', () => {
    tester.run('should allow valid use of nve-layout attribute values', rule, {
      valid: [
        '<div nve-layout="row"></div>',
        '<div nve-layout="row gap:sm"></div>',
        '<div nve-layout="column"></div>',
        '<div nve-layout="column gap:sm"></div>',
        '<div nve-layout="${layout}"></div>',
        '<div nve-layout=${layout}></div>',
        '<div nve-layout={{layout}}></div>',
        '<div nve-layout={%layout%}></div>'
      ],
      invalid: []
    });
  });

  it('should not allow invalid use of nve-layout attribute values', () => {
    tester.run('should not allow invalid use of nve-layout attribute values', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-layout="stack"></div>',
          errors: [{ messageId: 'unexpected-attribute-value', data: { attribute: 'nve-layout', value: 'stack' } }]
        },
        {
          code: '<div nve-layout="default"></div>',
          errors: [{ messageId: 'unexpected-attribute-value', data: { attribute: 'nve-layout', value: 'default' } }]
        },
        {
          code: '<div nve-layout="col"></div>',
          errors: [{ messageId: 'unexpected-attribute-value', data: { attribute: 'nve-layout', value: 'col' } }]
        },
        {
          code: '<div nve-layout="col gap:sm"></div>',
          errors: [{ messageId: 'unexpected-attribute-value', data: { attribute: 'nve-layout', value: 'col' } }]
        }
      ]
    });
  });

  it('should not allow invalid use of nve-display attribute values', () => {
    tester.run('should not allow invalid use of nve-display attribute values', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-display="row"></div>',
          errors: [{ messageId: 'unexpected-attribute-value', data: { attribute: 'nve-display', value: 'row' } }]
        }
      ]
    });
  });
});
