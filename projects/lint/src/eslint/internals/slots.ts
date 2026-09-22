// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { VALUE_BINDINGS } from './attributes.js';
import { elements } from '../internals/metadata.js';
import type { HtmlAttribute, HtmlTagNode } from '../rule-types.js';

export type SlotAssignment =
  | { kind: 'default'; attribute?: HtmlAttribute }
  | { kind: 'named'; attribute: HtmlAttribute; name: string }
  | { kind: 'dynamic'; attribute: HtmlAttribute };

function getAttributeName(attribute: HtmlAttribute): string {
  return attribute.key?.value ?? attribute.name ?? '';
}

function isSlotBinding(attributeName: string): boolean {
  return ['.slot', ':slot', '[slot]', '[attr.slot]'].includes(attributeName);
}

/** Resolve a child's slot assignment without guessing the value of a framework binding. */
export function getSlotAssignment(node: HtmlTagNode): SlotAssignment {
  const attribute = node.attributes?.find(candidate => {
    const attributeName = getAttributeName(candidate).toLowerCase();
    return attributeName === 'slot' || isSlotBinding(attributeName);
  });

  if (!attribute) {
    return { kind: 'default' };
  }

  const attributeName = getAttributeName(attribute).toLowerCase();
  const value = attribute.value?.value ?? '';
  if (attributeName !== 'slot' || VALUE_BINDINGS.some(binding => value.includes(binding))) {
    return { kind: 'dynamic', attribute };
  }

  return value ? { kind: 'named', attribute, name: value } : { kind: 'default', attribute };
}

export function hasSlot(tagName: string, slot: string) {
  const exceptions = ['nve-select'];
  if (exceptions.includes(tagName)) {
    return true;
  } else {
    const element = elements.find(el => el.name === tagName);
    return !!element?.manifest?.slots?.find(s => s.dynamic || s.name === slot);
  }
}

export function hasDefaultSlot(tagName: string) {
  const element = elements.find(el => el.name === tagName);
  return !!element?.manifest?.slots?.find(s => s.name === '');
}

export function isKnownElement(tagName: string) {
  return !!elements.find(el => el.name === tagName);
}

export function getRecommendedSlotName(slot: string, tagName: string) {
  const element = elements.find(el => el.name === tagName);
  const slots = element?.manifest?.slots?.map(s => s.name)?.filter(s => s !== undefined) ?? [];
  const hasUnnamedSlot = slots.includes('');
  let recommendedSlot = slots[0];

  // the unnamed slot is not always listed first, so slot="default" must map to it explicitly
  if (slot === 'default' && hasUnnamedSlot) {
    recommendedSlot = '';
  }

  const potentialMatch = slots.find(s => s.includes(slot));
  if (potentialMatch) {
    recommendedSlot = potentialMatch;
  }

  return recommendedSlot;
}
