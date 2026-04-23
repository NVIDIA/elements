// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { NotificationGroup } from '@nvidia-elements/core/notification';
import '@nvidia-elements/core/notification/define.js';

describe(NotificationGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: NotificationGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-notification-group>

      </nve-notification-group>
    `);
    element = fixture.querySelector(NotificationGroup.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(NotificationGroup.metadata.tag)).toBeDefined();
  });

  it('should be a manual popover type, to prevent closure of other type auto popovers', () => {
    expect(element.popoverType).toBe('manual');
  });
});
