import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import css from '@eslint/css';
import noUnexpectedCssValue from './no-unexpected-css-value.js';

describe('noUnexpectedCssValue', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      language: 'css/css',
      languageOptions: {
        tolerant: true
      },
      plugins: {
        css
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noUnexpectedCssValue.meta).toBeDefined();
    expect(noUnexpectedCssValue.meta.type).toBe('problem');
    expect(noUnexpectedCssValue.meta.docs).toBeDefined();
    expect(noUnexpectedCssValue.meta.docs.description).toBe('Disallow use of invalid CSS values.');
    expect(noUnexpectedCssValue.meta.docs.category).toBe('Best Practice');
    expect(noUnexpectedCssValue.meta.docs.recommended).toBe(true);
    expect(noUnexpectedCssValue.meta.docs.url).toContain('/docs/lint/');
    expect(noUnexpectedCssValue.meta.schema).toBeDefined();
    expect(noUnexpectedCssValue.meta.messages).toBeDefined();
  });

  it('should report unexpected use of CSS value - space', () => {
    tester.run(
      'should report unexpected use of CSS value - space',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { margin: var(--nve-ref-space-sm); }', // valid token assignment
          ':root { margin: 1px; }', // out of bounds of space scale
          ':root { margin-right: 1px; }', // out of bounds of space scale
          ':root { margin: 1000px; }', // out of bounds of space scale
          ':root { margin-right: 1000px; }', // out of bounds of space scale
          ':root { margin: 1rem; }', // ignore relative units
          ':root { gap: var(--nve-ref-space-sm); }', // valid token assignment
          ':root { gap: 1px; }', // out of bounds of space scale
          ':root { gap-inline: 1px; }', // out of bounds of space scale
          ':root { gap: 1000px; }', // out of bounds of space scale
          ':root { gap-inline: 1000px; }', // out of bounds of space scale
          ':root { gap: 1rem; }', // ignore relative units
          ':root { color: 1rem; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { margin: 12px; }',
            output: ':root { margin: var(--nve-ref-space-sm); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '12', unit: 'px', property: 'margin', alternate: 'var(--nve-ref-space-sm)' }
              }
            ]
          },
          {
            code: ':root { margin: 13px; }',
            errors: [
              // unknown value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '13', unit: 'px', property: 'margin', alternate: 'var(--nve-ref-space-*)' }
              }
            ]
          },
          {
            code: ':root { gap: 12px; }',
            output: ':root { gap: var(--nve-ref-space-sm); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '12', unit: 'px', property: 'gap', alternate: 'var(--nve-ref-space-sm)' }
              }
            ]
          },
          {
            code: ':root { gap: 13px; }',
            errors: [
              // unknown value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '13', unit: 'px', property: 'gap', alternate: 'var(--nve-ref-space-*)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - size', () => {
    tester.run(
      'should report unexpected use of CSS value - space',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { width: var(--nve-ref-size-300); }', // valid token assignment
          ':root { height: var(--nve-ref-size-300); }', // valid token assignment
          ':root { width: 1px; }', // out of bounds of size scale
          ':root { width: 1000px; }', // out of bounds of size scale
          ':root { height: 1px; }', // out of bounds of size scale
          ':root { height: 1000px; }', // out of bounds of size scale
          ':root { height: 1rem; }', // ignore relative units
          ':root { width: 1rem; }', // ignore relative units
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { width: 12px; }',
            output: ':root { width: var(--nve-ref-size-300); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '12', unit: 'px', property: 'width', alternate: 'var(--nve-ref-size-300)' }
              }
            ]
          },
          {
            code: ':root { width: 13px; }',
            errors: [
              // unknown value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '13', unit: 'px', property: 'width', alternate: 'var(--nve-ref-size-*)' }
              }
            ]
          },
          {
            code: ':root { height: 12px; }',
            output: ':root { height: var(--nve-ref-size-300); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '12', unit: 'px', property: 'height', alternate: 'var(--nve-ref-size-300)' }
              }
            ]
          },
          {
            code: ':root { height: 13px; }',
            errors: [
              // unknown value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '13', unit: 'px', property: 'height', alternate: 'var(--nve-ref-size-*)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - font-size', () => {
    tester.run(
      'should report unexpected use of CSS value - font-size',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { font-size: var(--nve-ref-font-size-100); }', // valid token assignment
          ':root { font-size: 10px; }', // out of bounds of font-size scale
          ':root { font-size: 1000px; }', // out of bounds of font-size scale
          ':root { font-size: 1rem; }', // ignore relative units
          ':root { font-size: 10rem; }', // ignore relative units
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { font-size: 12px; }',
            output: ':root { font-size: var(--nve-ref-font-size-100); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '12', unit: 'px', property: 'font-size', alternate: 'var(--nve-ref-font-size-100)' }
              }
            ]
          },
          {
            code: ':root { font-size: 13px; }',
            errors: [
              // unknown value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '13', unit: 'px', property: 'font-size', alternate: 'var(--nve-ref-font-size-*)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - font-weight', () => {
    tester.run(
      'should report unexpected use of CSS value - font-weight',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { font-weight: var(--nve-ref-font-weight-100); }', // valid token assignment
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          // unknown value assignment
          {
            code: ':root { font-weight: 950; }',
            errors: [
              {
                messageId: 'unexpected-css-value',
                data: { value: '950', unit: '', property: 'font-weight', alternate: 'var(--nve-ref-font-weight-*)' }
              }
            ]
          },
          // known value assignment
          {
            code: ':root { font-weight: bold; }',
            output: ':root { font-weight: var(--nve-ref-font-weight-bold); }',
            errors: [
              {
                messageId: 'unexpected-css-value',
                data: { value: 'bold', unit: '', property: 'font-weight', alternate: 'var(--nve-ref-font-weight-bold)' }
              }
            ]
          },
          // known value assignment
          {
            code: ':root { font-weight: 200; }',
            output: ':root { font-weight: var(--nve-ref-font-weight-light); }',
            errors: [
              {
                messageId: 'unexpected-css-value',
                data: { value: '200', unit: '', property: 'font-weight', alternate: 'var(--nve-ref-font-weight-light)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - line-height', () => {
    tester.run(
      'should report unexpected use of CSS value - line-height',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { line-height: var(--nve-ref-font-line-height-100); }', // valid token assignment
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { line-height: 16px; }',
            output: ':root { line-height: var(--nve-ref-font-line-height-400); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-value',
                data: {
                  value: '16',
                  unit: 'px',
                  property: 'line-height',
                  alternate: 'var(--nve-ref-font-line-height-400)'
                }
              }
            ]
          },
          {
            code: ':root { line-height: 10px; }',
            errors: [
              // unknown value assignment
              {
                messageId: 'unexpected-css-value',
                data: {
                  value: '10',
                  unit: 'px',
                  property: 'line-height',
                  alternate: 'var(--nve-ref-font-line-height-*)'
                }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - opacity', () => {
    tester.run(
      'should report unexpected use of CSS value - opacity',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { opacity: var(--nve-ref-opacity-100); }', // valid token assignment
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          // known value assignment
          {
            code: ':root { opacity: 0.5; }',
            output: ':root { opacity: var(--nve-ref-opacity-500); }',
            errors: [
              {
                messageId: 'unexpected-css-value',
                data: { value: '0.5', unit: '', property: 'opacity', alternate: 'var(--nve-ref-opacity-500)' }
              }
            ]
          },
          // unknown value assignment
          {
            code: ':root { opacity: 0.55; }',
            errors: [
              {
                messageId: 'unexpected-css-value',
                data: { value: '0.55', unit: '', property: 'opacity', alternate: 'var(--nve-ref-opacity-*)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - border-radius', () => {
    tester.run(
      'should report unexpected use of CSS value - border-radius',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { border-radius: var(--nve-ref-border-radius-100); }', // valid token assignment
          ':root { border-radius: var(--nve-ref-border-radius-none); }', // valid token assignment
          ':root { border-radius: 120px; }', // out of bounds of size scale
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { border-radius: 8px; }',
            output: ':root { border-radius: var(--nve-ref-border-radius-md); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-value',
                data: {
                  value: '8',
                  unit: 'px',
                  property: 'border-radius',
                  alternate: 'var(--nve-ref-border-radius-md)'
                }
              }
            ]
          },
          {
            code: ':root { border-radius: 12px; }',
            errors: [
              // unknown value assignment
              {
                messageId: 'unexpected-css-value',
                data: {
                  value: '12',
                  unit: 'px',
                  property: 'border-radius',
                  alternate: 'var(--nve-ref-border-radius-*)'
                }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - border-radius custom properties', () => {
    tester.run(
      'should report unexpected use of CSS value - border-radius custom properties',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [':host { --border-radius: var(----nve-ref-border-radius-sm); }'],
        invalid: [
          {
            code: ':host { --border-radius: 4px; }',
            output: ':host { --border-radius: var(--nve-ref-border-radius-xs); }',
            errors: [
              {
                messageId: 'unexpected-css-value',
                data: {
                  value: '4px',
                  unit: '',
                  property: '--border-radius',
                  alternate: 'var(--nve-ref-border-radius-xs)'
                }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - border-width', () => {
    tester.run(
      'should report unexpected use of CSS value - border-width',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { border-width: var(--nve-ref-border-width-sm); }', // valid token assignment
          ':root { border-width: var(--nve-ref-border-width-none); }', // valid token assignment
          ':root { border-width: 1000px; }', // out of bounds of size scale
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { border-width: 2px; }',
            output: ':root { border-width: var(--nve-ref-border-width-md); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-value',
                data: { value: '2', unit: 'px', property: 'border-width', alternate: 'var(--nve-ref-border-width-md)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - box-shadow', () => {
    tester.run(
      'should report unexpected use of CSS value - box-shadow',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { box-shadow: var(--nve-ref-shadow-100); }', // valid token assignment
          ':root { box-shadow: Highlight; }', // ignore native Highlight/focus
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { box-shadow: 0px 16px 32px 0px #000; }',
            errors: [
              {
                messageId: 'unexpected-css-value',
                data: { value: '0px', unit: '', property: 'box-shadow', alternate: 'var(--nve-ref-shadow-*)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - color', () => {
    tester.run(
      'should report unexpected use of CSS value - color',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { color: var(--nve-sys-support-success-color); }', // valid token assignment
          ':root { background: var(--nve-sys-accent-primary-background); }', // valid token assignment
          ':root { width: 100px; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { color: #000; }',
            errors: [
              {
                messageId: 'unexpected-css-value',
                data: { value: '#000', unit: '', property: 'color', alternate: 'var(--nve-*-color)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS value - custom properties', () => {
    tester.run(
      'should report unexpected use of CSS value - custom properties',
      noUnexpectedCssValue as unknown as JSRuleDefinition,
      {
        valid: [
          ':host { --color: var(--nve-sys-support-success-color); }', // valid token assignment
          ':host { --background: var(--nve-sys-accent-primary-background); }' // valid token assignment
        ],
        invalid: [
          {
            code: ':host { --color: #000; }',
            errors: [
              {
                messageId: 'unexpected-css-value',
                data: { value: '#000', unit: '', property: '--color', alternate: 'var(--nve-*-color)' }
              }
            ]
          }
        ]
      }
    );
  });
});
