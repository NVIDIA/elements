// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Dialog } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

describe(Dialog.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Dialog;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dialog closable modal>
        <nve-dialog-header>
          <h3 nve-text="heading">header</h3>
        </nve-dialog-header>
        <p nve-text="body">content</p>
        <nve-dialog-footer>
          <p nve-text="body">footer</p>
        </nve-dialog-footer>
      </nve-dialog>
    `);
    element = fixture.querySelector(Dialog.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Dialog.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
