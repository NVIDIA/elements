// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { File } from '@nvidia-elements/core/file';
import '@nvidia-elements/core/file/define.js';

describe(File.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: File;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-file>
        <label>label</label>
        <input type="file" />
      </nve-file>
    `);
    element = fixture.querySelector(File.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([File.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
