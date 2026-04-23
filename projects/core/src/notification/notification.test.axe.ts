// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Notification } from '@nvidia-elements/core/notification';
import '@nvidia-elements/core/notification/define.js';

describe(Notification.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Notification;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button popovertarget="notification">button</button>
      <nve-notification closable>hello</nve-notification>
    `);
    element = fixture.querySelector(Notification.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Notification.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
