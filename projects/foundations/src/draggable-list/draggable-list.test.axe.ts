// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { DraggableList } from '@nvidia-elements/foundations/draggable-list';
import '@nvidia-elements/foundations/draggable-list/define.js';

describe(DraggableList.metadata.tag, () => {
  it.each(['vertical', 'horizontal', 'disabled', 'picked'])('preserves content semantics in state %s', async state => {
    const fixture = await createFixture(html`
      <nve-draggable-list><button>Prepare data</button><button>Train model</button><button nve-draggable="dropzone">Move to end</button></nve-draggable-list>
    `);
    try {
      const list = fixture.querySelector('nve-draggable-list')!;
      list.orientation = state === 'horizontal' ? 'horizontal' : 'vertical';
      list.disabled = state === 'disabled';
      await elementIsStable(list);
      if (state === 'picked') list.querySelector('button')!.click();
      await elementIsStable(list);
      expect((await runAxe(['nve-draggable-list'])).violations).toHaveLength(0);
    } finally {
      removeFixture(fixture);
    }
  });
});
