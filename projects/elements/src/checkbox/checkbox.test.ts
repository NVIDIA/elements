// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Checkbox } from '@nvidia-elements/core/checkbox';
import '@nvidia-elements/core/checkbox/define.js';

describe(Checkbox.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Checkbox;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-checkbox>
        <label>label</label>
        <input type="checkbox" />
      </nve-checkbox>
    `);
    element = fixture.querySelector(Checkbox.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Checkbox.metadata.tag)).toBeDefined();
  });
});
