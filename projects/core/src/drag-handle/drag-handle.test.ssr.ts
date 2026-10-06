// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { DragHandle } from '@nvidia-elements/core/drag-handle';
import '@nvidia-elements/core/drag-handle/define.js';

describe(DragHandle.metadata.tag, () => {
  it.each(['default', 'pressed', 'disabled'])('should render the fixed grip in the %s state', async state => {
    const result = await ssrRunner.render(html`
      <nve-drag-handle ?pressed=${state === 'pressed'} ?disabled=${state === 'disabled'} aria-label="Move item"></nve-drag-handle>
    `);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-drag-handle');
    expect(result).toContain('name="drag"');
    expect(result).toContain('aria-hidden="true"');
  });
});
