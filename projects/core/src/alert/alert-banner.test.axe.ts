// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { AlertBanner } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

/* eslint-disable @nvidia-elements/lint/no-deprecated-tags */

describe(AlertBanner.metadata.tag, () => {
  let fixture: HTMLElement;
  let alertGroup: AlertBanner;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-alert-banner>
        <nve-alert closable>
          <span slot="prefix">default</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>

      <nve-alert-banner status="accent">
        <nve-alert closable>
          <span slot="prefix">accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>

      <nve-alert-banner status="warning">
        <nve-alert closable>
          <span slot="prefix">warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>

      <nve-alert-banner status="success">
        <nve-alert closable>
          <span slot="prefix">success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>

      <nve-alert-banner status="danger">
        <nve-alert closable>
          <span slot="prefix">danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>
    `);
    alertGroup = fixture.querySelector('nve-alert-banner');
    await elementIsStable(alertGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-alert-banner'], {
      rules: {
        'color-contrast': { enabled: false },
        'aria-prohibited-attr': { enabled: false }
      }
    });
    expect(results.violations.length).toBe(0);
  });
});
