// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { DialogHeader } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

/** eslint-disable @nvidia-elements/lint/no-missing-popover-trigger */

describe(DialogHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DialogHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dialog>
        <nve-dialog-header>hello</nve-dialog-header>
      </nve-dialog>
    `);
    element = fixture.querySelector(DialogHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DialogHeader.metadata.tag)).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
