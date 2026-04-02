// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Alert, AlertGroup } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

describe(AlertGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let alerts: NodeListOf<Alert>;
  let alertGroup: AlertGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-alert-group>
        <nve-alert>alert</nve-alert>
        <nve-alert>alert</nve-alert>
      </nve-alert-group>
    `);
    alerts = fixture.querySelectorAll(Alert.metadata.tag);
    alertGroup = fixture.querySelector(AlertGroup.metadata.tag);
    await elementIsStable(alertGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get(Alert.metadata.tag)).toBeDefined();
    expect(customElements.get(AlertGroup.metadata.tag)).toBeDefined();
  });

  it('should provide a aria role of group to describe content', async () => {
    await elementIsStable(alertGroup);
    expect(alertGroup._internals.role).toBe('group');
  });

  it('should sync group status to all child alerts within group', async () => {
    await elementIsStable(alertGroup);
    expect(alerts[0].status).toBe(undefined);
    expect(alerts[1].status).toBe(undefined);

    alertGroup.status = 'success';
    await elementIsStable(alertGroup);
    expect(alerts[0].status).toBe('success');
    expect(alerts[1].status).toBe('success');
  });

  it('should sync group status to newly added alerts', async () => {
    alertGroup.status = 'success';
    await elementIsStable(alertGroup);
    const alert = document.createElement(Alert.metadata.tag) as Alert;
    expect(alert.status).toBe(undefined);

    alertGroup.appendChild(alert);
    await elementIsStable(alertGroup);
    await elementIsStable(alert);
    expect(alert.status).toBe('success');
  });
});
