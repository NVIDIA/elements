// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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
