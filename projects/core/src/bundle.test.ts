// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { Badge } from '@nvidia-elements/core/badge';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/bundle.js';

describe('cdn bundle', () => {
  it('should mark the global state as the bundled build', () => {
    expect(globalThis.NVE_ELEMENTS.state.bundle).toBe(true);
  });

  it('should register bundled custom elements', () => {
    expect(customElements.get(Badge.metadata.tag)).toBe(Badge);
    expect(customElements.get(Button.metadata.tag)).toBe(Button);
  });
});
