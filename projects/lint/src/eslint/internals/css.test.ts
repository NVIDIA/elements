// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { selectorTargetsNveElement, selectorsForRule } from './css.js';
import type { CssRuleNode, CssSelectorChild, CssSelectorNode } from '../rule-types.js';

function typeSelector(name: string): CssSelectorChild {
  return { type: 'TypeSelector', name };
}

function selector(...children: CssSelectorChild[]): CssSelectorNode {
  return { type: 'Selector', children };
}

function cssRule(prelude?: CssRuleNode['prelude']): CssRuleNode {
  return prelude === undefined ? { type: 'Rule' } : { type: 'Rule', prelude };
}

describe('CSS selector helpers', () => {
  it('should return selectors from a selector-list rule', () => {
    const nveCard = selector(typeSelector('nve-card'));
    const input = selector(typeSelector('input'));

    expect(selectorsForRule(cssRule())).toEqual([]);
    expect(selectorsForRule(cssRule({ type: 'AtRule' }))).toEqual([]);
    expect(selectorsForRule(cssRule({ type: 'SelectorList' }))).toEqual([]);
    expect(selectorsForRule(cssRule({ type: 'SelectorList', children: [nveCard, input] }))).toEqual([nveCard, input]);
  });

  it('should identify selectors that target Elements components', () => {
    expect(selectorTargetsNveElement(selector(typeSelector('nve-card')), false)).toBe(true);
    expect(
      selectorTargetsNveElement(
        selector(typeSelector('nve-card'), { type: 'Combinator', name: '>' }, typeSelector('input')),
        false
      )
    ).toBe(false);
    expect(selectorTargetsNveElement(selector({ type: 'NestingSelector' }), true)).toBe(true);
    expect(selectorTargetsNveElement(selector(typeSelector('div')), false)).toBe(false);
    expect(
      selectorTargetsNveElement(
        selector(typeSelector('nve-card'), { type: 'PseudoElementSelector', name: 'part' }),
        false
      )
    ).toBe(false);
  });
});
