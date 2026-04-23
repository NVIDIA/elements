// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyDeclaration } from 'lit';
import { property } from 'lit/decorators/property.js';

/**
 * Enables declarative way to set host element attributes such as slots.
 * Use when needing to set host attributes but not create a public API property/attr for consumer.
 */
export function hostAttr(options: PropertyDeclaration = { type: String, reflect: true }) {
  return property({ type: String, reflect: true, ...options });
}
