// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { DraggableList } from '@nvidia-elements/foundations/draggable-list';
import '@nvidia-elements/foundations/draggable-list/define.js';

describe(DraggableList.metadata.tag, () => {
  it('renders the consumer slot and status region without browser work', async () => {
    const markup = await ssrRunner.render(
      html`<nve-draggable-list orientation="horizontal"><button>Prepare data</button><button nve-draggable="dropzone">Append</button></nve-draggable-list>`
    );
    expect(markup).toContain('shadowroot="open"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('Prepare data');
    expect(markup).not.toContain('draggable="true"');
  });
});
