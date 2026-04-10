// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { elements } from '../internals/metadata.js';

export function hasSlot(tagName: string, slot: string) {
  const exceptions = ['nve-select'];
  if (exceptions.includes(tagName)) {
    return true;
  } else {
    const element = elements.find(element => element.name === tagName);
    return !!element?.manifest?.slots?.find(s => s.name === slot);
  }
}

export function hasDefaultSlot(tagName: string) {
  const element = elements.find(element => element.name === tagName);
  return !!element?.manifest?.slots?.find(s => s.name === '');
}

export function isKnownElement(tagName: string) {
  return !!elements.find(element => element.name === tagName);
}

export function getRecommendedSlotName(slot: string, tagName: string) {
  const element = elements.find(element => element.name === tagName);
  const slots = element?.manifest?.slots?.map(s => s.name)?.filter(s => s !== undefined) ?? [];
  const hasUnnamedSlot = slots.find(s => s === '');
  let recommendedSlot = slots[0];

  if (tagName === 'default' && hasUnnamedSlot) {
    recommendedSlot = '';
  }

  const potentialMatch = slots.find(s => s.includes(slot));
  if (potentialMatch) {
    recommendedSlot = potentialMatch;
  }

  return recommendedSlot;
}
