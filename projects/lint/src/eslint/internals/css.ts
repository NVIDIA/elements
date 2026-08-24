// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CssRuleNode, CssSelectorChild, CssSelectorNode } from '../rule-types.js';

const IDENTITY_PSEUDO_CLASSES = new Set(['is', 'where']);

function isNveTypeSelector(child: CssSelectorChild): boolean {
  return child.type === 'TypeSelector' && child.name?.toLowerCase().startsWith('nve-') === true;
}

function isNestingSelector(child: CssSelectorChild): boolean {
  return child.type === 'NestingSelector';
}

function selectorChildren(selector: CssSelectorNode): CssSelectorChild[] {
  return selector.children ?? [];
}

function lastCompound(selector: CssSelectorNode): CssSelectorChild[] {
  const children = selectorChildren(selector);
  let start = 0;
  for (let index = 0; index < children.length; index += 1) {
    if (children[index]?.type === 'Combinator') start = index + 1;
  }
  return children.slice(start);
}

function pseudoClassTargetsNveElement(child: CssSelectorChild): boolean {
  if (
    child.type !== 'PseudoClassSelector' ||
    child.name === undefined ||
    !IDENTITY_PSEUDO_CLASSES.has(child.name.toLowerCase())
  ) {
    return false;
  }

  const selectorList = child.children?.find(argument => argument.type === 'SelectorList');
  const selectors = selectorList?.children as CssSelectorNode[] | undefined;
  return selectors?.some(selector => selectorTargetsNveElement(selector, false)) ?? false;
}

export function selectorsForRule(node: CssRuleNode): CssSelectorNode[] {
  if (node.prelude?.type !== 'SelectorList') return [];
  return (node.prelude.children ?? []).filter(selector => selector.type === 'Selector');
}

export function selectorTargetsNveElement(selector: CssSelectorNode, parentTargetsNve: boolean): boolean {
  const compound = lastCompound(selector);
  if (compound.some(child => child.type === 'PseudoElementSelector')) return false;
  return (
    compound.some(isNveTypeSelector) ||
    compound.some(pseudoClassTargetsNveElement) ||
    (parentTargetsNve && compound.some(isNestingSelector))
  );
}
