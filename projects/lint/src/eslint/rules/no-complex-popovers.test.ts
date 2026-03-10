import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noComplexPopovers from './no-complex-popovers.js';

const rule = noComplexPopovers as unknown as JSRuleDefinition;

function repeat(tag: string, count: number): string {
  return Array.from({ length: count }, () => `<${tag}></${tag}>`).join('');
}

describe('noComplexPopovers', () => {
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
    expect(noComplexPopovers.meta).toBeDefined();
    expect(noComplexPopovers.meta.type).toBe('problem');
    expect(noComplexPopovers.meta.docs).toBeDefined();
    expect(noComplexPopovers.meta.docs.description).toBe('Disallow excessive DOM complexity inside popover elements.');
    expect(noComplexPopovers.meta.docs.category).toBe('Best Practice');
    expect(noComplexPopovers.meta.docs.recommended).toBe(true);
    expect(noComplexPopovers.meta.docs.url).toBe('https://NVIDIA.github.io/elements/docs/lint/');
    expect(noComplexPopovers.meta.schema).toEqual([]);
    expect(noComplexPopovers.meta.messages).toBeDefined();
    expect(noComplexPopovers.meta.messages['complex-popover']).toBe(
      '<{{element}}> has {{count}} child elements (max {{max}}). Simplify the popover content for accessibility and UX.'
    );
    expect(noComplexPopovers.meta.messages['disallowed-popover-child']).toBe(
      '<{{child}}> should not be used inside <{{element}}>. Popover content should be simple for accessibility and UX.'
    );
  });

  it('should allow non-popover elements with any complexity', () => {
    tester.run('should allow non-popover elements', rule, {
      valid: [
        `<div>${repeat('span', 50)}</div>`,
        `<section>${repeat('div', 100)}</section>`,
        '<nve-button>click</nve-button>'
      ],
      invalid: []
    });
  });

  it('should allow dialog and drawer within 25 element limit', () => {
    tester.run('should allow simple dialogs and drawers', rule, {
      valid: [
        `<nve-dialog><div><p>Content</p></div></nve-dialog>`,
        `<nve-drawer><div><p>Content</p></div></nve-drawer>`,
        `<nve-dialog>${repeat('div', 25)}</nve-dialog>`,
        `<nve-drawer>${repeat('div', 25)}</nve-drawer>`
      ],
      invalid: []
    });
  });

  it('should allow tooltip, toggletip, notification, toast within 5 element limit', () => {
    tester.run('should allow simple small popovers', rule, {
      valid: [
        '<nve-tooltip><span>tip</span></nve-tooltip>',
        '<nve-toggletip><span>info</span></nve-toggletip>',
        '<nve-notification><span>msg</span></nve-notification>',
        '<nve-toast><span>msg</span></nve-toast>',
        `<nve-tooltip>${repeat('span', 5)}</nve-tooltip>`,
        `<nve-toggletip>${repeat('span', 5)}</nve-toggletip>`
      ],
      invalid: []
    });
  });

  it('should not count excluded data tags towards the limit', () => {
    tester.run('should not count excluded tags', rule, {
      valid: [
        `<nve-tooltip><select>${repeat('option', 100)}</select></nve-tooltip>`,
        `<nve-tooltip><ul>${repeat('li', 100)}</ul></nve-tooltip>`,
        `<nve-tooltip><table><tbody>${repeat('tr', 100)}</tbody></table></nve-tooltip>`,
        `<nve-tooltip><table><tbody><tr>${repeat('td', 100)}</tr></tbody></table></nve-tooltip>`,
        `<nve-dialog><table>${'<tr><td>a</td><td>b</td><th>c</th></tr>'.repeat(20)}</table></nve-dialog>`,
        `<nve-tooltip>${repeat('<nve-grid-cell></nve-grid-cell>', 100)}</nve-tooltip>`,
        `<nve-tooltip>${repeat('<nve-grid-column></nve-grid-column>', 100)}</nve-tooltip>`,
        `<nve-tooltip>${repeat('<nve-grid-row></nve-grid-row>', 100)}</nve-tooltip>`
      ],
      invalid: []
    });
  });

  it('should skip popovers with template syntax', () => {
    tester.run('should skip template syntax', rule, {
      valid: [
        `<nve-tooltip>\${dynamicContent}</nve-tooltip>`,
        `<nve-tooltip>{{ dynamicContent }}</nve-tooltip>`,
        `<nve-tooltip>{% block content %}</nve-tooltip>`
      ],
      invalid: []
    });
  });

  it('should report dialog exceeding 50 elements', () => {
    tester.run('should report complex dialog', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-dialog>${repeat('div', 51)}</nve-dialog>`,
          errors: [
            {
              messageId: 'complex-popover',
              data: { element: 'nve-dialog', count: '51', max: '50' }
            }
          ]
        }
      ]
    });
  });

  it('should report drawer exceeding 100 elements', () => {
    tester.run('should report complex drawer', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-drawer>${repeat('div', 101)}</nve-drawer>`,
          errors: [
            {
              messageId: 'complex-popover',
              data: { element: 'nve-drawer', count: '101', max: '100' }
            }
          ]
        }
      ]
    });
  });

  it('should report tooltip exceeding 5 elements', () => {
    tester.run('should report complex tooltip', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-tooltip>${repeat('span', 6)}</nve-tooltip>`,
          errors: [
            {
              messageId: 'complex-popover',
              data: { element: 'nve-tooltip', count: '6', max: '5' }
            }
          ]
        }
      ]
    });
  });

  it('should report toggletip exceeding 20 elements', () => {
    tester.run('should report complex toggletip', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-toggletip>${repeat('span', 21)}</nve-toggletip>`,
          errors: [
            {
              messageId: 'complex-popover',
              data: { element: 'nve-toggletip', count: '21', max: '20' }
            }
          ]
        }
      ]
    });
  });

  it('should report notification exceeding 5 elements', () => {
    tester.run('should report complex notification', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-notification>${repeat('span', 6)}</nve-notification>`,
          errors: [
            {
              messageId: 'complex-popover',
              data: { element: 'nve-notification', count: '6', max: '5' }
            }
          ]
        }
      ]
    });
  });

  it('should report toast exceeding 5 elements', () => {
    tester.run('should report complex toast', rule, {
      valid: [],
      invalid: [
        {
          code: `<nve-toast>${repeat('span', 6)}</nve-toast>`,
          errors: [
            {
              messageId: 'complex-popover',
              data: { element: 'nve-toast', count: '6', max: '5' }
            }
          ]
        }
      ]
    });
  });

  it('should count nested elements recursively', () => {
    tester.run('should count nested elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tooltip><div><span><em><strong><a href="#"><b>link</b></a></strong></em></span></div></nve-tooltip>',
          errors: [
            {
              messageId: 'complex-popover',
              data: { element: 'nve-tooltip', count: '6', max: '5' }
            }
          ]
        }
      ]
    });
  });

  it('should report disallowed complex elements inside popovers', () => {
    tester.run('should report disallowed elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-dialog><nve-page></nve-page></nve-dialog>',
          errors: [{ messageId: 'disallowed-popover-child', data: { child: 'nve-page', element: 'nve-dialog' } }]
        },
        {
          code: '<nve-tooltip><nve-card>content</nve-card></nve-tooltip>',
          errors: [{ messageId: 'disallowed-popover-child', data: { child: 'nve-card', element: 'nve-tooltip' } }]
        },
        {
          code: '<nve-drawer><nve-page-header></nve-page-header></nve-drawer>',
          errors: [{ messageId: 'disallowed-popover-child', data: { child: 'nve-page-header', element: 'nve-drawer' } }]
        },
        {
          code: '<nve-toast><nve-page-sidebar></nve-page-sidebar></nve-toast>',
          errors: [{ messageId: 'disallowed-popover-child', data: { child: 'nve-page-sidebar', element: 'nve-toast' } }]
        }
      ]
    });
  });

  it('should report deeply nested disallowed elements', () => {
    tester.run('should report nested disallowed elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tooltip><div><nve-card>content</nve-card></div></nve-tooltip>',
          errors: [{ messageId: 'disallowed-popover-child', data: { child: 'nve-card', element: 'nve-tooltip' } }]
        }
      ]
    });
  });

  it('should report multiple distinct disallowed elements once each', () => {
    tester.run('should report multiple disallowed elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-dialog><nve-page></nve-page><nve-card>content</nve-card></nve-dialog>',
          errors: [
            { messageId: 'disallowed-popover-child', data: { child: 'nve-page', element: 'nve-dialog' } },
            { messageId: 'disallowed-popover-child', data: { child: 'nve-card', element: 'nve-dialog' } }
          ]
        }
      ]
    });
  });

  it('should allow disallowed elements outside of popovers', () => {
    tester.run('should allow disallowed elements outside popovers', rule, {
      valid: [
        '<nve-page><nve-card>content</nve-card></nve-page>',
        '<div><nve-card>content</nve-card></div>',
        '<nve-page-header></nve-page-header>'
      ],
      invalid: []
    });
  });
});
