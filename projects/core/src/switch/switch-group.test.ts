// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { SwitchGroup } from './switch-group.js';
import './define.js';

describe('SwitchGroup', () => {
  let fixture: HTMLElement;
  let group: SwitchGroup;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<nve-switch-group><label>Options</label><nve-switch><input type="checkbox" aria-label="First" /></nve-switch><nve-switch><input type="checkbox" aria-label="Second" /></nve-switch></nve-switch-group>`
    );
    group = fixture.querySelector<SwitchGroup>('nve-switch-group')!;
    await elementIsStable(group);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('associates its label and both child controls', () => {
    expect(group).toBeInstanceOf(SwitchGroup);
    expect(group.label?.textContent).toBe('Options');
    expect(group.label?.slot).toBe('label');
    expect(group.inputs.filter(input => input instanceof HTMLInputElement)).toHaveLength(2);
    expect(group._internals.role).toBe('group');
  });

  it('reflects inherited layout and prominence properties', async () => {
    group.layout = 'horizontal';
    group.prominence = 'muted';
    await elementIsStable(group);
    expect(group.getAttribute('layout')).toBe('horizontal');
    expect(group.getAttribute('prominence')).toBe('muted');
  });
});
