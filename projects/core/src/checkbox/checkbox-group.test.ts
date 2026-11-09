// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { CheckboxGroup } from './checkbox-group.js';
import './define.js';

describe('CheckboxGroup', () => {
  let fixture: HTMLElement;
  let group: CheckboxGroup;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<nve-checkbox-group><label>Options</label><nve-checkbox><input type="checkbox" aria-label="First" /></nve-checkbox><nve-checkbox><input type="checkbox" aria-label="Second" /></nve-checkbox></nve-checkbox-group>`
    );
    const found = fixture.querySelector<CheckboxGroup>('nve-checkbox-group');
    if (!found) throw new Error('Expected control group');
    group = found;
    await elementIsStable(group);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('associates its label and both child controls', () => {
    expect(group).toBeInstanceOf(CheckboxGroup);
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
