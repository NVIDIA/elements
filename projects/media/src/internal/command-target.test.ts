// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { getCommandTarget } from './command-target.js';

describe('getCommandTarget', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('prioritizes an explicit element over the commandfor attribute', () => {
    const explicit = document.createElement('video');
    const host = Object.assign(document.createElement('div'), { commandForElement: explicit });
    host.setAttribute('commandfor', 'other');
    fixture.append(host);
    expect(getCommandTarget(host)).toBe(explicit);
  });

  it('resolves an id inside the same shadow root and leaves missing targets unset', () => {
    const root = document.createElement('div').attachShadow({ mode: 'open' });
    const target = document.createElement('video');
    target.id = 'player';
    const host = Object.assign(document.createElement('div'), { commandForElement: null });
    root.append(target, host);
    fixture.append(root.host);
    expect(getCommandTarget(host)).toBeNull();
    host.setAttribute('commandfor', 'player');
    expect(getCommandTarget(host)).toBe(target);
    host.setAttribute('commandfor', 'missing');
    expect(getCommandTarget(host)).toBeNull();
  });
});
