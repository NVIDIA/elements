// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import '@nvidia-elements/core/joystick/define.js';

describe('nve-joystick', () => {
  it('should render a recorded vector without a browser interaction', async () => {
    const result = await ssrRunner.render(
      html`<nve-joystick aria-label="Recording" readonly value='{"x":0.4,"y":-0.2}'></nve-joystick>`
    );
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-joystick');
    expect(result).toContain('70%');
  });
});
