// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('notification visual', () => {
  test('notification should match visual baseline', async () => {
    const report = await visualRunner.render('notification', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('notification should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('notification.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/notification/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <style>
    body {
      min-width: 1024px;
      min-height: 780px;
    }
  </style>

  <nve-notification-group position="center">
    <nve-notification inline closable>
      <h3 nve-text="label">•︎•︎•︎•︎•︎•︎</h3>
      <p nve-text="body">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</p>
    </nve-notification>
    <nve-notification status="accent" inline closable>
      <h3 nve-text="label">•︎•︎•︎•︎•︎•︎</h3>
      <p nve-text="body">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</p>
    </nve-notification>
    <nve-notification status="success" inline closable>
      <h3 nve-text="label">•︎•︎•︎•︎•︎•︎</h3>
      <p nve-text="body">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</p>
    </nve-notification>
    <nve-notification status="warning" inline closable>
      <h3 nve-text="label">•︎•︎•︎•︎•︎•︎</h3>
      <p nve-text="body">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</p>
    </nve-notification>
    <nve-notification status="danger" inline closable>
      <h3 nve-text="label">•︎•︎•︎•︎•︎•︎</h3>
      <p nve-text="body">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</p>
    </nve-notification>
  </nve-notification-group>
  `;
}
