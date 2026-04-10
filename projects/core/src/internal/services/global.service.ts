// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDuplicatePackageGlobalVersionWarning } from '../utils/audit-logs.js';
import { deepMerge } from '../utils/objects.js';
import { getEnv, getHostDetails } from './global.utils.js';

function createScopedRegistry(): CustomElementRegistry {
  const supported = globalThis.CustomElementRegistry && 'initialize' in CustomElementRegistry.prototype;
  return supported ? new CustomElementRegistry() : globalThis.customElements;
}

export class GlobalState {
  constructor() {
    globalThis.NVE_ELEMENTS ??= {
      debug: (log = console.log) =>
        log(
          `%cElements\n%c${JSON.stringify(globalThis.NVE_ELEMENTS.state, null, 2)}`,
          'color: #69b027',
          'color: inherit'
        ),
      state: {
        bundle: false,
        env: getEnv(),
        ...getHostDetails(),
        versions: [],
        scopedRegistry: {},
        elementRegistry: {},
        i18nRegistry: {},
        audit: {}
      }
    };

    /** @deprecated MLV_ELEMENTS */
    globalThis.MLV_ELEMENTS = globalThis.NVE_ELEMENTS;
    globalThis.NVE_ELEMENTS.state.versions = Array.from(new Set([...globalThis.NVE_ELEMENTS.state.versions, '0.0.0']));
    globalThis.NVE_ELEMENTS.state.scopedRegistry ??= {}; // if older versions used, they may not have a scopedRegistry
    globalThis.NVE_ELEMENTS.state.scopedRegistry['0.0.0'] = createScopedRegistry();

    if (globalThis.NVE_ELEMENTS.state.versions.length > 1 && globalThis.NVE_ELEMENTS.state.env !== 'production') {
      console.warn(
        getDuplicatePackageGlobalVersionWarning(),
        `\n\n${JSON.stringify(globalThis.NVE_ELEMENTS.state.versions, null, 2)}`
      );
    }
  }

  get state() {
    return globalThis.NVE_ELEMENTS.state;
  }

  dispatch(type: string, state: Partial<typeof globalThis.NVE_ELEMENTS.state>) {
    globalThis.NVE_ELEMENTS.state = deepMerge(
      globalThis.NVE_ELEMENTS.state as unknown as Record<string, unknown>,
      state as unknown as Record<string, unknown>
    ) as unknown as typeof globalThis.NVE_ELEMENTS.state;
    globalThis?.document?.dispatchEvent(new CustomEvent(type, { detail: globalThis.NVE_ELEMENTS.state }));
  }
}

export const GlobalStateService = new GlobalState();
