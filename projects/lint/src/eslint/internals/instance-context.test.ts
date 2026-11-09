// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { Linter, type Rule } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import type { HtmlTagNode } from '../rule-types.js';
import { canRenderTogether, getInstanceContext } from './instance-context.js';

type Instance = ReturnType<typeof getInstanceContext>;

function contexts(code: string, filename = 'src/example.html'): Instance[] {
  const instances: Instance[] = [];
  const capture = {
    meta: { schema: [] },
    create(context: Rule.RuleContext) {
      return createVisitors(context, {
        Tag(node: HtmlTagNode) {
          if (node.name === 'nve-tooltip') instances.push(getInstanceContext(context, node));
        }
      });
    }
  };
  const messages = new Linter().verify(
    code,
    [
      {
        files: ['**/*.{html,md,js,jsx,ts}'],
        languageOptions: { parser: htmlParser },
        plugins: { test: { rules: { capture } } },
        rules: { 'test/capture': 'error' }
      }
    ],
    { filename }
  );
  expect(messages).toEqual([]);
  return instances;
}

function together(instances: Instance[]): boolean {
  const [first, second] = instances;
  if (!first || !second) throw new Error('Expected two captured instances');
  return canRenderTogether(first, second);
}

describe('getInstanceContext', () => {
  it('groups ordinary siblings but isolates template boundaries', () => {
    expect(together(contexts('<nve-tooltip></nve-tooltip><nve-tooltip></nve-tooltip>'))).toBe(true);
    expect(
      together(
        contexts('<template><nve-tooltip></nve-tooltip></template><template><nve-tooltip></nve-tooltip></template>')
      )
    ).toBe(false);
  });

  it.each(['v-for="row in rows"', '*ngFor="let row of rows"', '[ngForOf]="rows"'])(
    'detects repeated markup under %s',
    attribute => {
      expect(contexts(`<div ${attribute}><nve-tooltip></nve-tooltip></div>`)[0]?.repeated).toBe(true);
    }
  );

  it('separates Vue alternative branches while retaining independent conditions', () => {
    expect(
      together(
        contexts(
          '<div v-if="a"><nve-tooltip></nve-tooltip></div> <!-- gap --> <div v-else><nve-tooltip></nve-tooltip></div>'
        )
      )
    ).toBe(false);
    expect(
      together(
        contexts('<div v-if="a"><nve-tooltip></nve-tooltip></div><div v-if="b"><nve-tooltip></nve-tooltip></div>')
      )
    ).toBe(true);
  });

  it('separates Markdown fences and ignores inline examples', () => {
    const markup = '<nve-tooltip></nve-tooltip>';
    expect(together(contexts('```html\n' + markup + '\n```\n\n```html\n' + markup + '\n```', 'src/example.md'))).toBe(
      false
    );
    expect(contexts('Use `' + markup + '` here.', 'src/example.md')[0]?.scope).toBeNull();
  });

  it('separates JavaScript templates and detects repeated template creation', () => {
    expect(
      together(
        contexts(
          'const a = html`<nve-tooltip></nve-tooltip>`; const b = html`<nve-tooltip></nve-tooltip>`;',
          'src/example.js'
        )
      )
    ).toBe(false);
    expect(contexts('rows.map(row => html`<nve-tooltip></nve-tooltip>`);', 'src/example.js')[0]?.repeated).toBe(true);
  });

  it('groups JSX siblings and logical inclusions while separating ternary branches', () => {
    expect(
      together(contexts('const a = <div><nve-tooltip />{ready && <nve-tooltip />}</div>;', 'src/example.jsx'))
    ).toBe(true);
    expect(together(contexts('const a = ready ? <nve-tooltip /> : <nve-tooltip />;', 'src/example.jsx'))).toBe(false);
  });

  it('leaves opaque TypeScript syntax without an inferred script scope', () => {
    expect(
      contexts('type Row = string; const a = html`<nve-tooltip></nve-tooltip>`;', 'src/example.ts')[0]?.scope
    ).toBeNull();
  });
});

describe('canRenderTogether', () => {
  it('does not merge missing scopes', () => {
    expect(canRenderTogether({ scope: null, repeated: false }, { scope: null, repeated: false })).toBe(false);
  });

  it('uses containing scope when present', () => {
    const containingScope = {};
    expect(
      canRenderTogether(
        { scope: {}, containingScope, repeated: false },
        { scope: {}, containingScope, repeated: false }
      )
    ).toBe(true);
  });
});
