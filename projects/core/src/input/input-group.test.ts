// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { InputGroup } from '@nvidia-elements/core/input';
import '@nvidia-elements/core/input/define.js';

describe(InputGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: InputGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-input-group>
        <nve-input>
          <label>label</label>
          <input type="text" />
        </nve-input>
        <nve-input>
          <label>label</label>
          <input type="text" />
        </nve-input>
      </nve-input-group>
    `);
    element = fixture.querySelector(InputGroup.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(InputGroup.metadata.tag)).toBeDefined();
  });

  it('should mark first and last controls in group', async () => {
    const controls = Array.from(fixture.querySelectorAll('[nve-control]'));
    expect(controls[0].hasAttribute('first-control')).toBe(true);
    expect(controls[1].hasAttribute('last-control')).toBe(true);
  });
});
