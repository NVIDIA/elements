// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Scene } from '@nvidia-elements/scene/scene';
import '@nvidia-elements/scene/scene/define.js';

describe(Scene.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Scene;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-scene></nve-scene>
    `);
    element = fixture.querySelector(Scene.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Scene.metadata.tag)).toBeDefined();
  });
});
