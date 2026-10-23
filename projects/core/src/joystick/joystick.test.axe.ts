// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import '@nvidia-elements/core/joystick/define.js';

describe('nve-joystick', () => {
  let fixture: HTMLElement;
  afterEach(() => removeFixture(fixture));

  it('should provide named groups for each constraint and availability state', async () => {
    fixture = await createFixture(html`
      <nve-joystick aria-label="Circular movement"></nve-joystick>
      <nve-joystick aria-label="Square movement" constraint="square" size="sm"></nve-joystick>
      <nve-joystick aria-label="Turn" constraint="horizontal"></nve-joystick>
      <nve-joystick aria-label="Height" constraint="vertical" size="lg"></nve-joystick>
      <nve-joystick aria-label="Recording" readonly value='{"x":0.2,"y":0.3}'></nve-joystick>
      <nve-joystick aria-label="Unavailable" disabled></nve-joystick>
    `);
    await Promise.all([...fixture.querySelectorAll('nve-joystick')].map(element => elementIsStable(element)));
    const result = await runAxe(['nve-joystick']);
    expect(result.violations).toEqual([]);
  });
});
