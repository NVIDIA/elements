// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { GlobalStateService } from '../services/global.service.js';
import type { ElementDefinition, LegacyDecoratorTarget } from '../types/index.js';
import { defineElement, supportsScopedRegistry } from '../utils/dom.js';

/** decorator which registers element dependencies with the scoped custom element registry when available */
export function scopedRegistry(): ClassDecorator {
  return (target: LegacyDecoratorTarget) => {
    const element = target as unknown as ElementDefinition;
    const customElementRegistry = GlobalStateService.state.scopedRegistry[element.metadata.version]!;
    if (supportsScopedRegistry) {
      Object.defineProperty(element, 'shadowRootOptions', {
        configurable: true,
        value: { ...(element.shadowRootOptions ?? { mode: 'open' }), customElementRegistry }
      });
    }
    defineElement(element, customElementRegistry);
  };
}
