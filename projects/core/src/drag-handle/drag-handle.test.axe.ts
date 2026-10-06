// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { DragHandle } from '@nvidia-elements/core/drag-handle';
import '@nvidia-elements/core/drag-handle/define.js';

describe(DragHandle.metadata.tag, () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-drag-handle aria-label="Move item"></nve-drag-handle>
      <nve-drag-handle pressed aria-label="Move selected item"></nve-drag-handle>
      <nve-drag-handle disabled aria-label="Move unavailable item"></nve-drag-handle>
      <nve-drag-handle pressed disabled aria-label="Move unavailable selected item"></nve-drag-handle>
      <span id="move-item-label">Move labeled item</span>
      <nve-drag-handle aria-labelledby="move-item-label"></nve-drag-handle>
    `);
    await Promise.all(Array.from(fixture.querySelectorAll('nve-drag-handle'), element => elementIsStable(element)));
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe for default, pressed, disabled, and labeled states', async () => {
    const results = await runAxe([DragHandle.metadata.tag]);
    expect(results.violations).toHaveLength(0);
  });
});
