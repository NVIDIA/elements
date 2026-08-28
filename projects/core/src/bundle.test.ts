// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { Badge } from './bundle.js';
// eslint-disable-next-line no-restricted-imports -- Verify the emitted bundle rather than the source entrypoint.
import '../dist/bundles/index.js';

describe('cdn bundle', () => {
  it('should mark the global state as the bundled build', () => {
    expect(globalThis.NVE_ELEMENTS.state.bundle).toBe(true);
  });

  it('should re-export component constructors from the source entry', () => {
    expect(Badge.metadata.tag).toBe('nve-badge');
  });

  it('should register bundled custom elements', () => {
    for (const tag of ['nve-badge', 'nve-button', 'nve-card-content', 'nve-page', 'nve-tabs-item']) {
      expect(customElements.get(tag)).toBeDefined();
    }
  });
});
