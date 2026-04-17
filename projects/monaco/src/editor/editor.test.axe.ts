// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';
import '@nvidia-elements/monaco/editor/define.js';

describe(MonacoEditor.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: MonacoEditor;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-editor></nve-monaco-editor>
    `);
    element = fixture.querySelector(MonacoEditor.metadata.tag);

    await untilEvent(element, 'ready');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check for status', async () => {
    const results = await runAxe([MonacoEditor.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
