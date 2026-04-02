// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Alert } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

describe(Alert.metadata.tag, () => {
  let fixture: HTMLElement;
  let alert: Alert;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-alert>default</nve-alert>
      <nve-alert status="accent">accent</nve-alert>
      <nve-alert status="warning">warning</nve-alert>
      <nve-alert status="success">success</nve-alert>
      <nve-alert status="danger">danger</nve-alert>
    `);
    alert = fixture.querySelector(Alert.metadata.tag);
    await elementIsStable(alert);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Alert.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
