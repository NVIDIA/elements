// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { GridPlaceholder } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

describe(GridPlaceholder.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: GridPlaceholder;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid-placeholder>

      </nve-grid-placeholder>
    `);
    element = fixture.querySelector(GridPlaceholder.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(GridPlaceholder.metadata.tag)).toBeDefined();
  });

  it('should set placeholder to have the grid role of row', () => {
    expect(element._internals.role).toBe('row');
  });

  it('should set placeholder inner content to have the grid role of gridcell', () => {
    expect(element.shadowRoot.querySelector('[role=gridcell]')).toBeTruthy();
  });
});
