// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function auditSlots(
  host: HTMLElement & { constructor: { metadata?: { children?: string[]; disallowedChildren?: string[] } } }
): [Element[], string[]] {
  const validElements = ['template', ...(host.constructor.metadata?.children ?? [])].filter(c => typeof c === 'string');
  const invalidElements = Array.from(host.shadowRoot!.querySelectorAll('slot'))
    .filter(slot => slot.name === '')
    .flatMap(slot =>
      slot.assignedElements({ flatten: true }).filter(e => !validElements.map(i => i).includes(e.localName))
    );
  return [invalidElements, validElements];
}

export function auditParentElement(
  host: HTMLElement & { constructor: { metadata?: { parents?: string[] } } }
): [boolean, string[]] {
  const validParentTags = host.constructor.metadata?.parents ?? [];
  return validParentTags.length
    ? [
        validParentTags.some(
          tag => host.parentElement?.localName === tag || host.assignedSlot?.parentElement?.localName === tag
        ),
        validParentTags
      ]
    : [true, []];
}
