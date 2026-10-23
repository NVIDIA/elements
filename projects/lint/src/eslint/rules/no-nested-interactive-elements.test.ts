// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import noNestedInteractiveElements from './no-nested-interactive-elements.js';

const rule = noNestedInteractiveElements as unknown as JSRuleDefinition;

const error = (element: string, parent = 'nve-tabs-item') => ({
  messageId: 'nested-interactive-element',
  data: { element, parent }
});

describe('noNestedInteractiveElements', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      languageOptions: { parser: htmlParser }
    });
  });

  it('should register the rule as a recommended error', () => {
    expect(elementsHtmlConfig.plugins?.['@nvidia-elements/lint']?.rules?.['no-nested-interactive-elements']).toBe(
      noNestedInteractiveElements
    );
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-nested-interactive-elements']).toEqual(['error']);
  });

  it('should allow decorations and existing rich label anchors', () => {
    tester.run('decorations and labels', rule, {
      valid: [
        '<nve-tabs-item><nve-icon slot="prefix" name="folder"></nve-icon>Tab<span slot="suffix">2</span></nve-tabs-item>',
        '<nve-tabs-item><a href="#panel"><nve-icon name="folder"></nve-icon>Tab</a></nve-tabs-item>',
        '<nve-tabs-item><a slot="prefix">Decoration</a>Tab</nve-tabs-item>'
      ],
      invalid: []
    });
  });

  it('should apply the configured containing elements', () => {
    tester.run('configured elements', rule, {
      valid: [
        { code: '<nve-button><button>Action</button></nve-button>', options: [{ elements: [] }] },
        { code: '<custom-control><button>Action</button></custom-control>', options: [{ elements: ['nve-button'] }] }
      ],
      invalid: [
        {
          code: '<custom-control><span><button>Action</button></span></custom-control>',
          options: [{ elements: ['custom-control'] }],
          errors: [error('button', 'custom-control')]
        },
        {
          code: '<button><a href="/settings">Settings</a></button>',
          options: [{ elements: ['button'] }],
          errors: [error('a', 'button')]
        }
      ]
    });
  });

  it('should preserve a single supported label anchor while inspecting its contents', () => {
    tester.run('label anchor behavior', rule, {
      valid: [
        '<nve-button><a href="/settings">Settings</a></nve-button>',
        '<nve-menu-item><a href="/settings">Settings</a></nve-menu-item>',
        '<nve-icon-button><a href="/settings">Settings</a></nve-icon-button>'
      ],
      invalid: [
        {
          code: '<nve-button><a href="/first">First</a><a href="/second">Second</a></nve-button>',
          errors: [error('a', 'nve-button')]
        },
        {
          code: '<nve-button><a href="/settings"><nve-icon-button></nve-icon-button></a></nve-button>',
          errors: [error('nve-icon-button', 'nve-button')]
        },
        {
          code: '<nve-button><span><a href="/settings">Settings</a></span></nve-button>',
          errors: [error('a', 'nve-button')]
        }
      ]
    });
  });

  it('should reject controls nested inside interactive tags', () => {
    tester.run('tag controls', rule, {
      valid: ['<nve-tag readonly><button>Action</button></nve-tag>'],
      invalid: [
        {
          code: '<nve-tag><nve-icon-button></nve-icon-button></nve-tag>',
          errors: [error('nve-icon-button', 'nve-tag')]
        },
        { code: '<nve-tag readonly closable><button>Action</button></nve-tag>', errors: [error('button', 'nve-tag')] }
      ]
    });
  });

  it('should allow independent controls beside the tab item', () => {
    tester.run('grouped accessories', rule, {
      valid: [
        '<nve-tabs><nve-tabs-item-group><nve-button slot="prefix">Pin</nve-button><nve-tabs-item>Tab</nve-tabs-item><nve-icon-button slot="suffix" aria-label="Close"></nve-icon-button></nve-tabs-item-group></nve-tabs>',
        '<nve-tabs-item-group><nve-tabs-item>Tab</nve-tabs-item><span slot="suffix"><button>Close</button></span></nve-tabs-item-group>'
      ],
      invalid: []
    });
  });

  it('should report known native controls in configured elements', () => {
    tester.run('native controls', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tabs-item>Tab<button>Close</button></nve-tabs-item>',
          errors: [error('button')]
        },
        {
          code: '<nve-tabs-item>Tab<select slot="suffix"><option>Menu</option></select></nve-tabs-item>',
          errors: [error('select')]
        },
        {
          code: '<nve-tabs-item>Tab<a slot="suffix" href="#settings">Settings</a></nve-tabs-item>',
          errors: [error('a')]
        }
      ]
    });
  });

  it('should exclude static hidden inputs while checking interactive and unknown input types', () => {
    tester.run('input types', rule, {
      valid: ['<nve-button><input type="hidden" name="action" value="save">Save</nve-button>'],
      invalid: [
        {
          code: '<nve-button><input type="text">Save</nve-button>',
          errors: [error('input', 'nve-button')]
        },
        {
          code: '<nve-button><input type=${inputType}>Save</nve-button>',
          errors: [error('input', 'nve-button')]
        }
      ]
    });
  });

  it('should report native media only when it exposes controls', () => {
    tester.run('native media controls', rule, {
      valid: [
        '<nve-tabs-item><video slot="prefix"></video>Tab<audio slot="suffix"></audio></nve-tabs-item>',
        '<nve-tabs-item-group><nve-tabs-item>Tab</nve-tabs-item><video controls slot="suffix"></video></nve-tabs-item-group>'
      ],
      invalid: [
        {
          code: '<nve-tabs-item><video controls slot="prefix"></video>Tab</nve-tabs-item>',
          errors: [error('video')]
        },
        {
          code: '<nve-tabs-item>Tab<span slot="suffix"><audio controls></audio></span></nve-tabs-item>',
          errors: [error('audio')]
        }
      ]
    });
  });

  it('should report known Elements controls even when disabled', () => {
    tester.run('Elements controls', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tabs-item>Tab<nve-icon-button slot="suffix" disabled></nve-icon-button></nve-tabs-item>',
          errors: [error('nve-icon-button')]
        },
        {
          code: '<nve-tabs-item><nve-media-pause-button slot="prefix"></nve-media-pause-button>Tab</nve-tabs-item>',
          errors: [error('nve-media-pause-button')]
        }
      ]
    });
  });

  it('should allow explicitly read-only decorative tags', () => {
    tester.run('read-only tags', rule, {
      valid: [
        '<nve-tabs-item>Tab<nve-tag readonly slot="suffix">2</nve-tag></nve-tabs-item>',
        '<nve-tabs-item><span slot="prefix"><nve-tag readonly="">Category</nve-tag></span>Tab</nve-tabs-item>'
      ],
      invalid: [
        {
          code: '<nve-tabs-item>Tab<nve-tag slot="suffix">2</nve-tag></nve-tabs-item>',
          errors: [error('nve-tag')]
        },
        {
          code: '<nve-tabs-item>Tab<nve-tag readonly closable slot="suffix">2</nve-tag></nve-tabs-item>',
          errors: [error('nve-tag')]
        },
        {
          code: '<nve-tabs-item>Tab<nve-tag readonly role="button" slot="suffix">2</nve-tag></nve-tabs-item>',
          errors: [error('nve-tag')]
        },
        {
          code: '<nve-tabs-item>Tab<nve-tag readonly=${readOnly} slot="suffix">2</nve-tag></nve-tabs-item>',
          errors: [error('nve-tag')]
        },
        {
          code: '<nve-tabs-item>Tab<nve-tag readonly .closable=${closable} slot="suffix">2</nve-tag></nve-tabs-item>',
          errors: [error('nve-tag')]
        },
        {
          code: '<nve-tabs-item>Tab<nve-tag readonly slot="suffix"><button>Action</button></nve-tag></nve-tabs-item>',
          errors: [error('button')]
        }
      ]
    });
  });

  it('should inspect wrappers without reporting a control twice', () => {
    tester.run('wrapped controls', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-tabs-item>Tab<span slot="suffix"><span><button>Close</button></span></span></nve-tabs-item>',
          errors: [error('button')]
        },
        {
          code: '<nve-tabs-item><span slot="prefix"><nve-input><input /></nve-input></span>Tab</nve-tabs-item>',
          errors: [error('nve-input')]
        }
      ]
    });
  });

  it('should reject independent controls regardless of slot assignment', () => {
    tester.run('slot assignments', rule, {
      valid: ['<nve-tabs-item><custom-button slot="prefix"></custom-button>Tab</nve-tabs-item>'],
      invalid: [
        {
          code: '<nve-tabs-item><button slot=${slotName}>Action</button>Tab</nve-tabs-item>',
          errors: [error('button')]
        },
        {
          code: '<nve-tabs-item><button .slot=${slotName}>Action</button>Tab</nve-tabs-item>',
          errors: [error('button')]
        },
        {
          code: '<nve-tabs-item><span slot="other"><button>Action</button></span>Tab</nve-tabs-item>',
          errors: [error('button')]
        }
      ]
    });
  });

  it('should ignore inert templates', () => {
    tester.run('non-rendered markup', rule, {
      valid: [
        '<nve-tabs-item>Tab<template slot="suffix"><button>Close</button></template></nve-tabs-item>',
        '<template><nve-button><button>Action</button></nve-button></template>'
      ],
      invalid: []
    });
  });

  it('should validate compositions inside declarative shadow roots without crossing the shadow boundary', () => {
    tester.run('declarative shadow roots', rule, {
      valid: ['<nve-button><template shadowrootmode="open"><button>Action</button></template></nve-button>'],
      invalid: [
        {
          code: '<div><template shadowrootmode="open"><nve-button><button>Action</button></nve-button></template></div>',
          errors: [error('button', 'nve-button')]
        },
        {
          code: '<div><template shadowrootmode="closed"><nve-button><button>Action</button></nve-button></template></div>',
          errors: [error('button', 'nve-button')]
        }
      ]
    });
  });

  it('should ignore inline Markdown examples without ignoring subsequent markup', () => {
    tester.run('inline Markdown', rule, {
      valid: [
        {
          filename: 'example.md',
          code: '`<nve-tabs-item>Tab<button slot="suffix">Close</button></nve-tabs-item>`'
        },
        {
          filename: 'example.md',
          code: '`<nve-button><nve-tag><button>Action</button></nve-tag></nve-button>`'
        },
        {
          filename: 'example.md',
          code: '<nve-button>Describes `<nve-tag><button>Action</button></nve-tag>`</nve-button>'
        }
      ],
      invalid: [
        {
          filename: 'example.md',
          code: 'Use `<nve-button>`.\n<nve-tag><button>Action</button></nve-tag>',
          errors: [error('button', 'nve-tag')]
        },
        {
          filename: 'example.md',
          code: '<nve-button>Describes `<span>` then <button>Action</button></nve-button>',
          errors: [error('button', 'nve-button')]
        },
        {
          filename: 'example.md',
          code: '<nve-button>Describes `<template>` then <nve-tag><button>Action</button></nve-tag></nve-button>',
          errors: [error('nve-tag', 'nve-button'), error('button', 'nve-tag')]
        }
      ]
    });
  });
});
